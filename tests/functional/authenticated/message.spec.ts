import { faker } from '@faker-js/faker'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { Message, User } from 'App/Models'
import { UserConversationFactory, UserFactory } from 'Database/factories'
import { DateTime } from 'luxon'

const URL = '/user/message'

test.group('User authenticated message', (group) => {
  let user: User
  let guest: User

  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    user = await UserFactory.with('profile', 1, (p) => p.with('about')).create()
    guest = await UserFactory.with('profile', 1, (p) => p.with('about')).create()
    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  // MessagesController.store

  test('[store] Should fail if user is not logged in', async ({ client, assert }) => {
    const response = await client
      .post(URL)
      .form({ username: guest.username, content: faker.lorem.text() })

    response.assertStatus(401)

    const body = response.body()

    assert.isArray(body.errors)
  })

  test('[store] Should fail if username does not exist in database', async ({ client, assert }) => {
    const response = await client
      .post(URL)
      .form({ username: 'guest.username', content: faker.lorem.text() })
      .loginAs(user)

    response.assertStatus(422)

    const body = response.body()

    assert.isArray(body.errors)
  })

  test('[store] Should fail if the username is the same as the user who is sending the message', async ({
    client
  }) => {
    const response = await client
      .post(URL)
      .form({ username: user.username, content: faker.lorem.text() })
      .loginAs(user)

    response.assertStatus(400)
  })

  test('[store] Should be possible for the user to send a message to another user', async ({
    client,
    assert
  }) => {
    const response = await client
      .post(URL)
      .form({
        username: guest.username,
        content: faker.lorem.text()
      })
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.equal(body.user.username, user.username)
  })

  // MessagesController.show

  test('[show] Should fail if user is not logged in', async ({ client }) => {
    const conversation = await UserConversationFactory.with('guest')
      .merge({ ownerId: user.id })
      .with('messages', 5, (msg) => msg.merge({ userId: user.id }))
      .create()

    const response = await client.get(`${URL}/${conversation.id}`)

    response.assertStatus(401)
  })

  test('[show] Should fail if conversation does not exist', async ({ client }) => {
    const response = await client.get(`${URL}/1`).loginAs(user)

    response.assertStatus(404)
  })

  test('[show] Should be possible to view all messages from users who are in a conversation', async ({
    client,
    assert
  }) => {
    const conversation = await UserConversationFactory.with('guest')
      .merge({ ownerId: user.id })
      .with('messages', 5, (msg) => msg.merge({ userId: user.id }))
      .create()

    const response = await client.get(`${URL}/${conversation.id}`).loginAs(user)

    response.assertStatus(200)

    assert.isArray(response.body())
  })

  // MessagesController.destroy

  test('[destroy] Should fail if user is not logged in', async ({ client }) => {
    const conversation = await UserConversationFactory.with('guest')
      .merge({ ownerId: user.id })
      .with('messages', 5, (msg) => msg.merge({ userId: user.id }))
      .create()

    const response = await client.delete(URL).form({ id: conversation.messages[2].id })

    response.assertStatus(401)
  })

  test('[destroy] Should fail if message does not exist', async ({ client }) => {
    await UserConversationFactory.with('guest')
      .merge({ ownerId: user.id })
      .with('messages', 5, (msg) => msg.merge({ userId: user.id }))
      .create()

    const response = await client.delete(URL).form({ id: 6 }).loginAs(user)

    response.assertStatus(422)
  })

  test('[destroy] Should fail if time to delete message has exceeded', async ({ client }) => {
    const conversation = await UserConversationFactory.with('guest')
      .merge({ ownerId: user.id })
      .with('messages', 5, (msg) =>
        msg.merge({ userId: user.id, createdAt: DateTime.now().plus({ minute: 50 }) })
      )
      .create()

    const response = await client
      .delete(URL)
      .form({ id: conversation.messages[2].id })
      .loginAs(user)

    response.assertStatus(400)
  })

  test('[destroy] Should fail if the user deleting the message is not the author', async ({
    client
  }) => {
    const conversation = await UserConversationFactory.with('guest')
      .merge({ ownerId: user.id })
      .with('messages', 5, (msg) => msg.merge({ userId: user.id }))
      .create()

    const response = await client
      .delete(URL)
      .form({ id: conversation.messages[2].id })
      .loginAs(conversation.guest)

    response.assertStatus(422)
  })

  test('[destroy] Should be possible for the user to delete his message', async ({
    client,
    assert
  }) => {
    const conversation = await UserConversationFactory.with('guest')
      .merge({ ownerId: user.id })
      .with('messages', 5, (msg) => msg.merge({ userId: user.id }))
      .create()

    const response = await client
      .delete(URL)
      .form({ id: conversation.messages[2].id })
      .loginAs(user)

    response.assertStatus(200)

    assert.isNull(await Message.findBy('id', conversation.messages[2].id))
  })
})
