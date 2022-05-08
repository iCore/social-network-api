import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class GroupMessages extends BaseSchema {
  protected tableName = 'group_messages'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('group_id')
        .unsigned()
        .references('id')
        .inTable('groups')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table.text('content').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
