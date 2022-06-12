import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { usersAbout } from 'App/Utils/user'

export default class About extends BaseSchema {
  protected tableName = 'abouts'

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

      table.timestamp('since', { useTz: true })
      table.timestamp('until', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
