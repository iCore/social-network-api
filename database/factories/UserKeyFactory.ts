import Factory from '@ioc:Adonis/Lucid/Factory'
import UserKey from 'App/Models/UserKey'
import { UserFactory } from 'Database/factories'

export default Factory.define(UserKey, ({ faker }) => ({
  token: faker.datatype.uuid()
}))
  .relation('user', () => UserFactory)
  .build()
