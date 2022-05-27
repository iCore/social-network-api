import { faker } from '@faker-js/faker'
import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { User } from 'App/Models'
import { UserKeysType } from 'App/Utils'
import { UserFactory, UserKeyFactory } from 'Database/factories'
import { DateTime } from 'luxon'

const URL = '/authentication'

test.group('Authentication', async (group) => {
  const password = faker.internet.password(8)
  let user: User

  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    user = await UserFactory.with('profile').merge({ password }).create()
    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  // MainsController.store

  test('[store] Should fail if email is not assigned', async ({ client, assert }) => {
    const response = await client.post(URL).form({ password })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.containsSubset(body.errors, [{ rule: 'required', field: 'email' }])
  })

  test('[store] Should fail if email is not valid', async ({ client, assert }) => {
    const response = await client.post(URL).form({ email: 'invalid email', password })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.containsSubset(body.errors, [{ rule: 'email', field: 'email' }])
  })

  test('[store] Should fail if email does not exist in database', async ({ client, assert }) => {
    const response = await client.post(URL).form({ email: faker.internet.email(), password })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.containsSubset(body.errors, [{ rule: 'exists', field: 'email' }])
  })

  test('[store] Should fail if email is from an inactive account', async ({ client, assert }) => {
    const user = await UserFactory.merge({ isActive: false }).with('profile').create()

    const response = await client.post(URL).form({ email: user.email, password })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.containsSubset(body.errors, [{ rule: 'exists', field: 'email' }])
  })

  test('[store] Should fail if password is not assigned', async ({ client, assert }) => {
    const response = await client.post(URL).form({ email: user.email })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.containsSubset(body.errors, [{ rule: 'required', field: 'password' }])
  })

  test('[store] Should fail if password is less than eight characters', async ({
    client,
    assert
  }) => {
    const response = await client
      .post(URL)
      .form({ email: user.email, password: faker.internet.password(7) })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.containsSubset(body.errors, [{ rule: 'minLength', field: 'password' }])
  })

  test('[store] Should be possible to connect to the user account and receive an access token', async ({
    client,
    assert
  }) => {
    const response = await client.post(URL).form({ email: user.email, password })

    const body = response.body()

    assert.properties(body, ['type', 'token'])
  })

  // MainsController.destroy

  test('[destroy] Should fail if access token is invalid', async ({ client }) => {
    const response = await client.delete(URL).bearerToken('invalid-token')

    response.assertStatus(401)
  })

  test('[destroy] Should be possible for the user to disconnect', async ({ client }) => {
    const response = await client.delete(URL).loginAs(user)

    response.assertStatus(200)
  })
})
