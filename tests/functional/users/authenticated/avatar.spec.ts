import Application from '@ioc:Adonis/Core/Application'
import Drive from '@ioc:Adonis/Core/Drive'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { User } from 'App/Models'
import { UserFactory } from 'Database/factories'

const URL = '/avatar'

test.group('Users authenticated avatar', (group) => {
  let user: User

  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    user = await UserFactory.with('profile').create()
    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  // AvatarsController.update

  test('[update] Should fail if user is not logged in', async ({ client, assert }) => {
    const response = await client.put(URL)

    const body = response.body()

    response.assertStatus(401)

    assert.isArray(body.errors)
  })

  test('[update] Should fail if the image is not attributed', async ({ client }) => {
    const response = await client.put(URL).loginAs(user)

    response.assertStatus(422)
  })

  test('[update] Should fail if the image is too large', async ({ client }) => {
    const response = await client
      .put(URL)
      .file('avatar', Application.makePath('tests', 'images', 'space-abstract-4k.jpg'))
      .loginAs(user)

    response.assertStatus(422)
  })

  test('[update] Should fail if the file is not a valid image', async ({ client }) => {
    const response = await client
      .put(URL)
      .file('avatar', Application.makePath('tests', 'images', 'invalid-image.txt'))
      .loginAs(user)

    response.assertStatus(422)
  })

  test('[update] Should be possible to change the image of the users avatar', async ({
    client,
    assert
  }) => {
    const drive = Drive.fake()

    const response = await client
      .put(URL)
      .file('avatar', Application.makePath('tests', 'images', 'photo-by-face-generator.jpg'))
      .loginAs(user)

    response.assertStatus(200)

    assert.isTrue(await drive.exists(`avatar/${user.username}`))
    assert.properties(response.body(), ['avatar'])

    Drive.restore()
  })

  // AvatarsController.destroy

  test('[destroy] Should fail if user is not logged in', async ({ client, assert }) => {
    const response = await client.delete(URL)

    const body = response.body()

    response.assertStatus(401)

    assert.isArray(body.errors)
  })

  test('[destroy] Should be possible to delete the users avatar image', async ({
    client,
    assert
  }) => {
    const drive = Drive.fake()

    const response = await client.delete(URL).loginAs(user)

    response.assertStatus(200)

    assert.isFalse(await drive.exists(`avatar/${user.username}`))

    Drive.restore()
  })
})
