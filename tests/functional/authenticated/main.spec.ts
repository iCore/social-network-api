import { faker } from '@faker-js/faker'
import Application from '@ioc:Adonis/Core/Application'
import Drive from '@ioc:Adonis/Core/Drive'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { User } from 'App/Models'
import { UserAbout, UserInterest } from 'App/Utils/user'
import { UserFactory } from 'Database/factories'

const URL = '/user/main'

test.group('User authenticated main', (group) => {
  let user: User

  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    user = await UserFactory.with('profile', 1, (p) => p.with('about')).create()
    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  // MainController.show

  test('[show] Should fail if user is not logged in', async ({ client, assert }) => {
    const response = await client.get(URL)

    const body = response.body()

    response.assertStatus(401)

    assert.isArray(body.errors)
  })

  test('[show] Should be possible to view the users', async ({ client, assert }) => {
    const response = await client.get(URL).loginAs(user)

    const body: User = response.body()

    response.assertStatus(200)

    assert.equal(user.email, body.email)
  })

  // MainController.update

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

  test('[update] Should fail if password confirmation is not assigned when a password is assigned', async ({
    client
  }) => {
    const password = faker.internet.password(8)
    const data = {
      password,
      username: faker.internet.userName(),
      profile: {
        biography: faker.lorem.text(),
        birthday: faker.date.soon(),
        fullName: faker.name.findName(),
        interest: 'anything' as UserInterest
      }
    }

    const response = await client.put(URL).form(data).loginAs(user)

    response.assertStatus(422)
  })

  test('[update] Should fail if password confirmation does not match password', async ({
    client
  }) => {
    const data = {
      password: faker.internet.password(8),
      passwordConfirmation: faker.internet.password(8),
      username: faker.internet.userName(),
      profile: {
        biography: faker.lorem.text(),
        birthday: faker.date.soon(),
        fullName: faker.name.findName(),
        interest: 'anything' as UserInterest
      }
    }

    const response = await client.put(URL).form(data).loginAs(user)

    response.assertStatus(422)
  })

  test('[update] Should fail if the password is less than eight characters long', async ({
    client
  }) => {
    const password = faker.internet.password(5)
    const data = {
      password,
      passwordConfirmation: password,
      username: faker.internet.userName(),
      profile: {
        biography: faker.lorem.text(),
        birthday: faker.date.soon(),
        fullName: faker.name.findName(),
        interest: 'anything' as UserInterest
      }
    }

    const response = await client.put(URL).form(data).loginAs(user)

    response.assertStatus(422)
  })

  test('[update] Should fail if username has already been registered', async ({ client }) => {
    const password = faker.internet.password(8)
    const data = {
      password,
      passwordConfirmation: password,
      username: user.username,
      profile: {
        biography: faker.lorem.text(),
        birthday: faker.date.soon(),
        fullName: faker.name.findName(),
        interest: 'anything' as UserInterest
      }
    }

    const response = await client.put(URL).form(data).loginAs(user)

    response.assertStatus(422)
  })

  test('[update] Should be possible for the user to update their account', async ({
    client,
    assert
  }) => {
    interface DataUser {
      password?: string
      passwordConfirmation?: string
      username?: string
      profile?: {
        biography?: string
        birthday?: Date
        fullName?: string
        interest?: UserInterest
      }
      about: Array<{
        type: UserAbout
        description?: string
        since?: Date
        until?: Date
      }>
    }

    const password = faker.internet.password(8)
    const data = {
      password,
      passwordConfirmation: password,
      username: faker.internet.userName(),
      profile: {
        biography: faker.lorem.text(),
        birthday: faker.date.soon(),
        fullName: faker.name.findName(),
        interest: 'anything'
      },
      about: [
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
    } as DataUser

    const response = await client.put(URL).form(data).loginAs(user)

    response.assertStatus(200)

    const account = await User.findByOrFail('id', user.id)
    await account.load('profile')
    await account.profile.load('about')

    assert.equal(data.username, account.username)
    assert.lengthOf(account.profile.about, 3)
  })

  // MainController.destroy

  test('[destroy] Should fail if user is not logged in', async ({ client, assert }) => {
    const response = await client.delete(URL)

    const body = response.body()

    response.assertStatus(401)

    assert.isArray(body.errors)
  })

  test('[destroy] Should be possible for the user to delete their account', async ({
    client,
    assert
  }) => {
    const drive = Drive.fake()
    const filePath = `avatar/${user.username}`

    await Drive.put(
      filePath,
      Application.makePath('tests', 'images', 'photo-by-face-generator.jpg')
    )

    const url = await Drive.getUrl(filePath)

    await user.profile.merge({ avatar: url })

    const response = await client.delete(URL).loginAs(user)

    response.assertStatus(200)

    assert.isFalse(await drive.exists(user.profile.avatar))
    assert.isNull(await User.findBy('id', user.id))

    Drive.restore()
  })
})
