import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { UserRole, userRoles } from 'App/Utils/user'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('username').unique().nullable()
      table.string('email').unique().notNullable()
      table.string('password').nullable()
      table.enum('role', userRoles).defaultTo('normal' as UserRole)
      table.boolean('is_active').defaultTo(false)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('disabled_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
