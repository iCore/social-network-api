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

  test('[show] Deve falhar caso o usuário não esteja conectado', async ({ client, assert }) => {
    const response = await client.get(`${URL}/${user.username}`)

    const body = response.body()

    response.assertStatus(401)

    assert.isArray(body.errors)
  })

  test('[show] Deve falhar caso o nome de usuário não exista no banco de dados', async ({
    client
  }) => {
    const response = await client.get(`${URL}/${faker.internet.userName()}`).loginAs(auth)

    response.assertStatus(422)
  })

  test('[show] Deve falhar caso o usuário do perfil esteja desativado', async ({ client }) => {
    const user = await UserFactory.merge({ isActive: false }).with('profile').create()
    const response = await client.get(`${URL}/${user.username}`).loginAs(auth)

    response.assertStatus(422)
  })

  test('[show] Deve ser possível visualizar o perfil do usuário', async ({ client, assert }) => {
    const response = await client.get(`${URL}/${user.username}`).loginAs(auth)

    const body: User = response.body()

    response.assertStatus(200)

    assert.equal(user.email, body.email)
  })
})
