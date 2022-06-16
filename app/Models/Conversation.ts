import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { Message, User } from 'App/Models'

export default class Conversation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public ownerId: number

  @column({ serializeAs: null })
  public guestId: number

  @hasMany(() => Message)
  public messages: HasMany<typeof Message>

  @belongsTo(() => User, { foreignKey: 'ownerId' })
  public owner: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'guestId' })
  public guest: BelongsTo<typeof User>
}
