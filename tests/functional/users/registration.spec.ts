import { UserKeysType } from 'App/Utils'
import { User } from 'App/Models'
import { faker } from '@faker-js/faker'
import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import Mail from '@ioc:Adonis/Addons/Mail'
import { UserFactory, UserKeyFactory } from 'Database/factories'

const URL = '/registration'

test.group('Users registration', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  // RegistrationsController.store

  test('Should fail if full name is not assigned', async ({ client }) => {
    const email = faker.internet.email()
    const redirectLink = faker.internet.url()

    const response = await client.post(URL).form({ email, redirectLink })

    response.assertStatus(422)
  })

  test('Should fail if email is not assigned', async ({ client }) => {
    const fullName = faker.name.findName()
    const redirectLink = faker.internet.url()

    const response = await client.post(URL).form({ fullName, redirectLink })

    response.assertStatus(422)
  })

  test('Should fail if redirect link is not assigned', async ({ client }) => {
    const email = faker.internet.email()
    const fullName = faker.name.findName()

    const response = await client.post(URL).form({ email, fullName })

    response.assertStatus(422)
  })

  test('Should fail if email is not valid', async ({ client }) => {
    const email = 'faker.internet.email()'
    const fullName = faker.name.findName()
    const redirectLink = faker.internet.url()

    const response = await client.post(URL).form({ email, fullName, redirectLink })

    response.assertStatus(422)
  })

  test('Should fail if redirect link is not valid', async ({ client }) => {
    const email = faker.internet.email()
    const fullName = faker.name.findName()
    const redirectLink = 'faker.internet.url()'

    const response = await client.post(URL).form({ email, fullName, redirectLink })

    response.assertStatus(422)
  })

  test('Should fail if the email is already registered', async ({ client }) => {
    const user = await UserFactory.create()

    const email = user.email
    const fullName = faker.name.findName()
    const redirectLink = faker.internet.url()

    const response = await client.post(URL).form({ email, fullName, redirectLink })

    response.assertStatus(422)
  })

  test('Should be possible to pre-register the user', async ({ client, assert }) => {
    const email = faker.internet.email()
    const fullName = faker.name.findName()
    const redirectLink = faker.internet.url()
    const mailer = Mail.fake()

    const response = await client.post(URL).form({ email, fullName, redirectLink })

    response.assertStatus(200)

    assert.isTrue(
      mailer.exists((mail) => {
        return (
          mail.subject === 'Account activation' &&
          mail.from?.address === 'noreply@social-network.api' &&
          mail.from?.name === 'Social Network' &&
          mail.to !== undefined &&
          mail.to[0].address === email &&
          mail.to[0].name === fullName
        )
      })
    )

    const account = await User.findByOrFail('email', email)

    await account.load('keys', (query) => {
      query.where('type', 'registration' as UserKeysType)
    })

    await account.load('profile')

    assert.lengthOf(account.keys, 1)
    assert.equal(fullName, account.profile.fullName)

    const message = mailer.find((mail) => {
      return mail.to !== undefined && mail.to[0].address === email
    })

    assert.include(message?.html, `${redirectLink}/${account.keys[0].token}`)

    Mail.restore()
  })

  // RegistrationsController.show

  test('Should fail if token is invalid [show]', async ({ client }) => {
    const response = await client.get(`${URL}/invalid-token`)

    response.assertStatus(422)
  })

  test('Should fail if token does not exist in database [show]', async ({ client }) => {
    const token = faker.datatype.uuid()

    const response = await client.get(`${URL}/${token}`)

    response.assertStatus(422)
  })

  test('Should be possible to see the user who is in pre-registration', async ({
    client,
    assert
  }) => {
    const userKey = await UserKeyFactory.merge({ type: 'registration' })
      .with('user', 1, (user) => user.with('profile'))
      .create()

    const user = userKey.user.serialize({
      fields: { pick: ['email'] },
      relations: { profile: { fields: { pick: ['full_name'] } } }
    })

    const response = await client.get(`${URL}/${userKey.token}`)

    response.assertStatus(200)

    assert.deepEqual(user, response.body())
  })

  // RegistrationsController.update

  test('Should fail if username is not assigned', async ({ client }) => {
    const userKey = await UserKeyFactory.merge({ type: 'registration' }).with('user').create()

    const password = faker.internet.password()

    const response = await client.put(`${URL}/${userKey.token}`).form({
      password,
      passwordConfirmation: password
    })

    response.assertStatus(422)
  })

  test('Should fail if password is not assigned', async ({ client }) => {
    const userKey = await UserKeyFactory.merge({ type: 'registration' }).with('user').create()

    const password = faker.internet.password()

    const response = await client.put(`${URL}/${userKey.token}`).form({
      username: faker.internet.userName(),
      passwordConfirmation: password
    })

    response.assertStatus(422)
  })

  test('Should fail if password confirmation is not assigned', async ({ client }) => {
    const userKey = await UserKeyFactory.merge({ type: 'registration' }).with('user').create()

    const password = faker.internet.password()

    const response = await client.put(`${URL}/${userKey.token}`).form({
      username: faker.internet.userName(),
      password
    })

    response.assertStatus(422)
  })

  test('Should fail if username has already been registered', async ({ client }) => {
    const user = await UserFactory.create()

    const userKey = await UserKeyFactory.merge({ type: 'registration' }).with('user').create()

    const password = faker.internet.password()

    const response = await client.put(`${URL}/${userKey.token}`).form({
      username: user.username,
      password,
      passwordConfirmation: password
    })

    response.assertStatus(422)
  })

  test('Should fail if password confirmation does not match password', async ({ client }) => {
    const userKey = await UserKeyFactory.merge({ type: 'registration' }).with('user').create()

    const response = await client.put(`${URL}/${userKey.token}`).form({
      username: faker.internet.userName(),
      password: faker.internet.password(),
      passwordConfirmation: faker.internet.password()
    })

    response.assertStatus(422)
  })

  test('Should fail if token is invalid [update]', async ({ client }) => {
    const password = faker.internet.password()

    const response = await client.put(`${URL}/invalid-token`).form({
      username: faker.internet.userName(),
      password,
      passwordConfirmation: password
    })

    response.assertStatus(422)
  })

  test('Should fail if token does not exist in database [update]', async ({ client }) => {
    const password = faker.internet.password()
    const token = faker.datatype.uuid()

    const response = await client.put(`${URL}/${token}`).form({
      username: faker.internet.userName(),
      password,
      passwordConfirmation: password
    })

    response.assertStatus(422)
  })

  test('Should be possible for the user to complete his registration and activate his account', async ({
    client,
    assert
  }) => {
    const userKey = await UserKeyFactory.merge({ type: 'registration' })
      .with('user', 1, (user) => user.merge({ isActive: false }))
      .create()

    const password = faker.internet.password()

    const response = await client.put(`${URL}/${userKey.token}`).form({
      username: faker.internet.userName(),
      password,
      passwordConfirmation: password
    })

    response.assertStatus(200)

    const user = await User.findByOrFail('id', userKey.userId)

    await user.load('keys', (query) => {
      query.where('type', 'registration' as UserKeysType)
    })

    assert.equal(user.isActive, true)
    assert.lengthOf(user.keys, 0)
  })
})
