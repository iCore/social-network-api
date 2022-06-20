import Factory from '@ioc:Adonis/Lucid/Factory'
import Conversation from 'App/Models/Conversation'
import { UserFactory, UserMessageFactory } from 'Database/factories'

export default Factory.define(Conversation, ({}) => ({}))
  .relation('guest', () => UserFactory)
  .relation('messages', () => UserMessageFactory)
  .build()
