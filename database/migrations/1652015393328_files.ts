import BaseSchema from '@ioc:Adonis/Lucid/Schema'

import { fileCategories } from './../../app/Utils/files'

export default class Files extends BaseSchema {
  protected tableName = 'files'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('owner_id').unsigned()

      table.string('name').notNullable()
      table.enum('category', fileCategories).notNullable()
      table.string('size').notNullable()
      table.string('type').notNullable()

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
