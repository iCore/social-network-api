import Factory from '@ioc:Adonis/Lucid/Factory'
import { Profile } from 'App/Models'
import { UserInterest } from 'App/Utils/user'
import { AboutFactory, UserFactory } from 'Database/factories'
import { DateTime } from 'luxon'

export default Factory.define(Profile, ({ faker }) => ({
  avatar: faker.internet.avatar(),
  fullName: faker.name.findName(undefined, undefined, 'male'),
  biography: faker.lorem.text(),
  birthday: DateTime.fromMillis(faker.date.past(10).getTime()),
  interest: 'women' as UserInterest
}))
  .relation('user', () => UserFactory)
  .relation('about', () => AboutFactory)
  .build()
