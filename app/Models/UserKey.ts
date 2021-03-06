import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { User } from 'App/Models'
import { UserKeysType } from 'App/Utils/user'
import { DateTime } from 'luxon'

export default class UserKey extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public userId: number

  @column()
  public token: string

  @column()
  public type: UserKeysType

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime()
  public expiredAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
