import { faker } from '@faker-js/faker'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { User } from 'App/Models'
import { UserInterest } from 'App/Utils/user'
import { UserFactory } from 'Database/factories'

const URL = '/profile'

test.group('User authenticated profile', (group) => {
  let user: User

  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    user = await UserFactory.with('profile').create()
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

    const body: User = response.body()

    response.assertStatus(200)

    assert.equal(user.email, body.email)
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
      profile: {
        biography: faker.lorem.text(),
        birthday: 'faker.date.soon()',
        fullName: faker.name.findName(),
        interest: 'anything' as UserInterest
      }
    }

    const response = await client.put(URL).form(data).loginAs(user)

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.containsSubset(body.errors, [{ rule: 'date.format', field: 'profile.birthday' }])
  })

  test('[update] Should fail if user interest is not in predefined list', async ({
    client,
    assert
  }) => {
    const data = {
      profile: {
        biography: faker.lorem.text(),
        birthday: faker.date.soon(),
        fullName: faker.name.findName(),
        interest: 'dog'
      }
    }
    const response = await client.put(URL).form(data).loginAs(user)

    const body = response.body()

    response.assertStatus(422)

    assert.isArray(body.errors)

    assert.containsSubset(body.errors, [{ rule: 'enum', field: 'profile.interest' }])
  })

  test('[update] Should be possible for the user to update their profile', async ({ client }) => {
    const data = {
      profile: {
        biography: faker.lorem.text(),
        birthday: faker.date.soon(),
        fullName: faker.name.findName(),
        interest: 'anything' as UserInterest
      }
    }

    const response = await client.put(URL).form(data).loginAs(user)

    response.assertStatus(200)
  })
})
