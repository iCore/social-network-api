import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { UserInterest, userInterests } from 'App/Utils/user'

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

      table.string('avatar').nullable()
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
