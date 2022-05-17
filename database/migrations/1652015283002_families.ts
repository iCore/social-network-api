import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { UserRelationship, userRelationships } from 'App/Utils/user'

export default class Families extends BaseSchema {
  protected tableName = 'families'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('profile_id')
        .unsigned()
        .references('id')
        .inTable('profiles')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table.enum('relationship', userRelationships).defaultTo('known' as UserRelationship)

      table.timestamp('since', { useTz: true })
      table.timestamp('until', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
