import { faker } from '@faker-js/faker'
import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { User } from 'App/Models'
import { UserKeysType } from 'App/Utils'
import { UserFactory, UserKeyFactory } from 'Database/factories'
import { DateTime } from 'luxon'

const URL = '/password-recovery'

test.group('Users password recovery', (group) => {
  let user: User

  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    user = await UserFactory.with('profile').create()

    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  // PasswordRecoveriesController.store

  test('[store] Should fail if email is not assigned', async ({ client, assert }) => {
    const redirectLink = faker.internet.url()

    const response = await client.post(URL).form({ redirectLink })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.lengthOf(body.errors, 1)

    assert.containsSubset(body.errors, [{ rule: 'required', field: 'email' }])
  })

  test('[store] Should fail if redirect link is not assigned', async ({ client, assert }) => {
    const response = await client.post(URL).form({ email: user.email })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.lengthOf(body.errors, 1)

    assert.containsSubset(body.errors, [{ rule: 'required', field: 'redirectLink' }])
  })

  test('[store] Should fail if email is not valid', async ({ client, assert }) => {
    const email = 'faker.internet.email()'

    const redirectLink = faker.internet.url()

    const response = await client.post(URL).form({ email, redirectLink })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.lengthOf(body.errors, 2)

    assert.containsSubset(body.errors, [{ rule: 'email', field: 'email' }])
    assert.containsSubset(body.errors, [{ rule: 'exists', field: 'email' }])
  })

  test('[store] Should fail if email is not exist', async ({ client, assert }) => {
    const email = faker.internet.email()

    const redirectLink = faker.internet.url()

    const response = await client.post(URL).form({ email, redirectLink })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.lengthOf(body.errors, 1)

    assert.containsSubset(body.errors, [{ rule: 'exists', field: 'email' }])
  })

  test('[store] Should fail if redirect link is not valid', async ({ client, assert }) => {
    const redirectLink = 'faker.internet.url()'

    const response = await client.post(URL).form({ email: user.email, redirectLink })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.lengthOf(body.errors, 1)

    assert.containsSubset(body.errors, [{ rule: 'url', field: 'redirectLink' }])
  })

  test('[store] Should be possible for the user to initiate the password recovery process', async ({
    client,
    assert
  }) => {
    const redirectLink = faker.internet.url()
    const mailer = Mail.fake()

    const response = await client.post(URL).form({ email: user.email, redirectLink })

    response.assertStatus(200)

    assert.isTrue(
      mailer.exists((mail) => {
        return (
          mail.subject === 'Password recovery' &&
          mail.from?.address === 'noreply@social-network.api' &&
          mail.from?.name === 'Social Network' &&
          mail.to !== undefined &&
          mail.to[0].address === user.email &&
          mail.to[0].name === user.profile.fullName
        )
      })
    )

    const account = await User.findByOrFail('email', user.email)

    await account.load('keys', (query) => {
      query.where('type', 'password_recovery' as UserKeysType)
    })

    assert.lengthOf(account.keys, 1)
    assert.isTrue(DateTime.now() < account.keys[0].expiredAt)

    const message = mailer.find(
      (mail) => mail.to !== undefined && mail.to[0].address === user.email
    )

    assert.include(message?.html, `${redirectLink}/${account.keys[0].token}`)

    Mail.restore()
  })

  // PasswordRecoveriesController.show

  test('[show] Should fail if token is invalid', async ({ client }) => {
    const response = await client.get(`${URL}/invalid-token`)

    response.assertStatus(422)
  })

  test('[show] Should fail if token does not exist in database', async ({ client }) => {
    const token = faker.datatype.uuid()

    const response = await client.get(`${URL}/${token}`)

    response.assertStatus(422)
  })

  test('[show] Should fail if the token is expired', async ({ client }) => {
    const userKey = await UserKeyFactory.merge({
      type: 'password_recovery',
      expiredAt: DateTime.now().minus({ day: 1 })
    })
      .with('user', 1, (user) => user.with('profile'))
      .create()

    const response = await client.get(`${URL}/${userKey.token}`)

    response.assertStatus(400)
  })

  test('[show] Should be possible to see the user who is in retrieving their password', async ({
    client,
    assert
  }) => {
    const userKey = await UserKeyFactory.merge({
      type: 'password_recovery',
      expiredAt: DateTime.now().plus({ day: 1 })
    })
      .with('user', 1, (user) => user.with('profile'))
      .create()

    const response = await client.get(`${URL}/${userKey.token}`)
    const body = response.body()

    response.assertStatus(200)

    assert.properties(body, ['expiredAt', 'email', 'profile'])
    assert.properties(body.profile, ['full_name'])
  })

  // PasswordRecoveriesController.update

  test('[update] Should fail if token is invalid', async ({ client }) => {
    const password = faker.internet.password()

    const response = await client.put(`${URL}/invalid-token`).form({
      password,
      passwordConfirmation: password
    })

    response.assertStatus(422)
  })

  test('[update] Should fail if token does not exist in database', async ({ client }) => {
    const password = faker.internet.password()
    const token = faker.datatype.uuid()

    const response = await client.put(`${URL}/${token}`).form({
      password,
      passwordConfirmation: password
    })

    response.assertStatus(422)
  })

  test('[update] Should fail if the token is expired', async ({ client }) => {
    const password = faker.internet.password()
    const userKey = await UserKeyFactory.merge({
      type: 'password_recovery',
      expiredAt: DateTime.now().minus({ day: 1 })
    })
      .with('user', 1, (user) => user.with('profile'))
      .create()

    const response = await client.get(`${URL}/${userKey.token}`).form({
      password,
      passwordConfirmation: password
    })

    response.assertStatus(400)
  })

  test('[update] Should fail if password is not assigned', async ({ client, assert }) => {
    const userKey = await UserKeyFactory.merge({ type: 'registration' }).with('user').create()

    const password = faker.internet.password()

    const response = await client.put(`${URL}/${userKey.token}`).form({
      passwordConfirmation: password
    })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.lengthOf(body.errors, 1)

    assert.containsSubset(body.errors, [{ rule: 'required', field: 'password' }])
  })

  test('[update] Should fail if password confirmation is not assigned', async ({
    client,
    assert
  }) => {
    const userKey = await UserKeyFactory.merge({ type: 'registration' }).with('user').create()

    const password = faker.internet.password()

    const response = await client.put(`${URL}/${userKey.token}`).form({
      username: faker.internet.userName(),
      password
    })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.lengthOf(body.errors, 1)

    assert.containsSubset(body.errors, [{ rule: 'confirmed', field: 'passwordConfirmation' }])
  })

  test('[update] Should fail if password confirmation does not match password', async ({
    client,
    assert
  }) => {
    const userKey = await UserKeyFactory.merge({ type: 'password_recovery' }).with('user').create()

    const response = await client.put(`${URL}/${userKey.token}`).form({
      password: faker.internet.password(),
      passwordConfirmation: faker.internet.password()
    })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.lengthOf(body.errors, 1)

    assert.containsSubset(body.errors, [{ rule: 'confirmed', field: 'passwordConfirmation' }])
  })

  test('[update] Should fail if the password is less than eight characters long', async ({
    client,
    assert
  }) => {
    const userKey = await UserKeyFactory.merge({ type: 'password_recovery' }).with('user').create()
    const password = faker.internet.password(7)

    const response = await client.put(`${URL}/${userKey.token}`).form({
      password,
      passwordConfirmation: password
    })

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.lengthOf(body.errors, 1)

    assert.containsSubset(body.errors, [{ rule: 'minLength', field: 'password' }])
  })

  test('[update] Should be possible for the user to complete updating their password', async ({
    client,
    assert
  }) => {
    const userKey = await UserKeyFactory.merge({
      type: 'password_recovery',
      expiredAt: DateTime.now().plus({ day: 1 })
    })
      .with('user', 1, (user) => user.with('profile'))
      .create()

    const password = faker.internet.password()

    const response = await client.put(`${URL}/${userKey.token}`).form({
      password,
      passwordConfirmation: password
    })

    response.assertStatus(200)

    const user = await User.findByOrFail('id', userKey.userId)

    assert.notEqual(user.password, userKey.user.password)

    await user.load('keys', (query) => {
      query.where('type', 'password_recovery' as UserKeysType)
    })

    assert.lengthOf(user.keys, 0)
  })
})
