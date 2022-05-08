import { usersAbout } from 'App/Utils/user'
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class About extends BaseSchema {
  protected tableName = 'about'

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

      table.enum('type', usersAbout).nullable()
      table.text('description').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
