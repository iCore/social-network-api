import Factory from '@ioc:Adonis/Lucid/Factory'
import User from 'App/Models/User'
import { UserRole } from 'App/Utils/user'

import { UserProfileFactory } from './profile'
import { UserKeyFactory } from './userKey'

export const UserFactory = Factory.define(User, ({ faker }) => ({
  email: faker.internet.email(),
  isActive: true,
  password: faker.internet.password(),
  username: faker.internet.userName(),
  role: 'normal' as UserRole
}))
  .relation('keys', () => UserKeyFactory)
  .relation('profile', () => UserProfileFactory)
  .build()
