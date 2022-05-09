import { UserFactory } from 'Database/factories/user'
import UserKey from 'App/Models/UserKey'
import Factory from '@ioc:Adonis/Lucid/Factory'

export const UserKeyFactory = Factory.define(UserKey, ({ faker }) => ({
  token: faker.datatype.uuid()
}))
  .relation('user', () => UserFactory)
  .build()
