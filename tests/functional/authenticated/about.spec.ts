import { faker } from '@faker-js/faker'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { User } from 'App/Models'
import { UserFactory } from 'Database/factories'

const URL = '/user/about'

test.group('User authenticated about', (group) => {
  let user: User

  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    user = await UserFactory.with('profile', 1, (p) => p.with('about')).create()
    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  // AboutController.show

  test('[show] Should fail if user is not logged in', async ({ client, assert }) => {
    const response = await client.get(URL)

    const body = response.body()

    response.assertStatus(401)

    assert.isArray(body.errors)
  })

  test('[show] Should be possible to view the users about', async ({ client, assert }) => {
    const response = await client.get(URL).loginAs(user)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  // AboutController.update

  test('[update] Should fail if user is not logged in', async ({ client, assert }) => {
    const response = await client.put(URL)

    const body = response.body()

    response.assertStatus(401)

    assert.isArray(body.errors)
  })

  test('[update] Should be possible for the user to update their about', async ({
    client,
    assert
  }) => {
    const about = [
      {
        type: 'lived_in',
        description: faker.lorem.text(),
        since: faker.date.soon(),
        until: faker.date.soon()
      },
      {
        type: 'studied_at',
        description: faker.lorem.text(),
        since: faker.date.soon(),
        until: faker.date.soon()
      },
      {
        type: 'worked_in',
        description: faker.lorem.text(),
        since: faker.date.soon(),
        until: faker.date.soon()
      }
    ]

    const response = await client.put(URL).form({ about }).loginAs(user)

    response.assertStatus(200)

    const account = await User.findByOrFail('id', user.id)

    await account.load('profile')
    await account.profile.load('about')

    assert.lengthOf(account.profile.about, 3)
  })
})
