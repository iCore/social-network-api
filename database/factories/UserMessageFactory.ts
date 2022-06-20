import Factory from '@ioc:Adonis/Lucid/Factory'
import Message from 'App/Models/Message'

export default Factory.define(Message, ({ faker }) => ({
  content: faker.lorem.sentence()
})).build()
