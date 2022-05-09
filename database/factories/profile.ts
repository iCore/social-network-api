import { UserInterest } from 'App/Utils/user'
import { DateTime } from 'luxon'
import { Profile } from 'App/Models'
import { UserFactory } from './user'
import Factory from '@ioc:Adonis/Lucid/Factory'

export const UserProfileFactory = Factory.define(Profile, ({ faker }) => ({
  fullName: faker.name.findName(undefined, undefined, 'male'),
  biography: faker.lorem.text(),
  birthday: DateTime.fromMillis(faker.date.past(10).getTime()),
  interest: 'women' as UserInterest
}))
  .relation('user', () => UserFactory)
  .build()
