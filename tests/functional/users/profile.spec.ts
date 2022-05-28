import { faker } from '@faker-js/faker'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { User } from 'App/Models'
import { UserFactory } from 'Database/factories/user'

const URL = '/profile'

test.group('Users profile', (group) => {
  let user: User
  let auth: User

  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    user = await UserFactory.with('profile').create()
    auth = await UserFactory.with('profile').create()
    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  // ProfilesController.show

  test('[show] Should fail if user is not logged in', async ({ client, assert }) => {
    const response = await client.get(`${URL}/${user.username}`)

    const body = response.body()

    response.assertStatus(401)

    assert.isArray(body.errors)
  })

  test('[show] Should fail if username does not exist in database', async ({ client }) => {
    const response = await client.get(`${URL}/${faker.internet.userName()}`).loginAs(auth)

    response.assertStatus(422)
  })

  test('[show] Should fail if profile user is disabled', async ({ client }) => {
    const user = await UserFactory.merge({ isActive: false }).with('profile').create()
    const response = await client.get(`${URL}/${user.username}`).loginAs(auth)

    response.assertStatus(422)
  })

  test('[show] Should be possible to view the users profile', async ({ client, assert }) => {
    const response = await client.get(`${URL}/${user.username}`).loginAs(auth)

    const body: User = response.body()

    response.assertStatus(200)

    assert.equal(user.email, body.email)
  })
})
