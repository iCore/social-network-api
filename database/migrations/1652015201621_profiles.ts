import { userInterests, UserInterest } from 'App/Utils/user'
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Profiles extends BaseSchema {
  protected tableName = 'profiles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table.text('biography').nullable()
      table.string('full_name').notNullable()

      table.timestamp('birthday', { useTz: true }).nullable()
      table.enum('interest', userInterests).defaultTo('anything' as UserInterest)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
