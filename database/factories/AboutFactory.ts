import Factory from '@ioc:Adonis/Lucid/Factory'
import { Profile } from 'App/Models'
import about from 'App/Models/about'
import { UserAboutType } from 'App/Utils/user'
import { DateTime } from 'luxon'

export default Factory.define(about, ({ faker }) => ({
  type: 'lived_in' as UserAboutType,
  description: faker.lorem.text(),
  since: DateTime.fromMillis(faker.date.between(1, 5).getTime()),
  until: DateTime.fromMillis(faker.date.between(6, 10).getTime())
}))
  .relation('profile', () => Profile)
  .build()
