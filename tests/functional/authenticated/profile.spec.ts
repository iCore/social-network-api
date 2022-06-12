import { faker } from '@faker-js/faker'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { Profile, User } from 'App/Models'
import { UserFactory } from 'Database/factories'

const URL = '/user/profile'

test.group('User authenticated profile', (group) => {
  let user: User

  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    user = await UserFactory.with('profile', 1, (p) => p.with('about')).create()
    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  // ProfilesController.show

  test('[show] Should fail if user is not logged in', async ({ client, assert }) => {
    const response = await client.get(URL)

    const body = response.body()

    response.assertStatus(401)

    assert.isArray(body.errors)
  })

  test('[show] Should be possible to view the users profile', async ({ client, assert }) => {
    const response = await client.get(URL).loginAs(user)

    const body: Profile = response.body()

    response.assertStatus(200)

    assert.equal(user.profile.fullName, body.fullName)
  })

  // ProfilesController.update

  test('[update] Should fail if user is not logged in', async ({ client, assert }) => {
    const response = await client.put(URL)

    const body = response.body()

    response.assertStatus(401)

    assert.isArray(body.errors)
  })

  test('[update] Should fail if a birthday data is in an invalid format', async ({
    client,
    assert
  }) => {
    const data = {
      biography: faker.lorem.text(),
      birthday: 'faker.date.soon()',
      fullName: faker.name.findName(),
      interest: 'anything'
    }

    const response = await client.put(URL).form(data).loginAs(user)

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.containsSubset(body.errors, [{ rule: 'date.format', field: 'birthday' }])
  })

  test('[update] Should fail if user interest is not in predefined list', async ({
    client,
    assert
  }) => {
    const data = {
      biography: faker.lorem.text(),
      birthday: faker.date.soon(),
      fullName: faker.name.findName(),
      interest: 'dog'
    }

    const response = await client.put(URL).form(data).loginAs(user)

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.containsSubset(body.errors, [{ rule: 'enum', field: 'interest' }])
  })

  test('[update] Should be possible for the user to update their account', async ({
    client,
    assert
  }) => {
    const data = {
      biography: faker.lorem.text(),
      birthday: faker.date.soon(),
      fullName: faker.name.findName(),
      interest: 'anything'
    }

    const response = await client.put(URL).form(data).loginAs(user)

    response.assertStatus(200)

    const account = await User.findByOrFail('id', user.id)
    await account.load('profile')

    assert.equal(data.fullName, account.profile.fullName)
  })
})
