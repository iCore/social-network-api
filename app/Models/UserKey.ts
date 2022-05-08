import { UserKeysType } from 'App/Utils/user'
import { Users } from 'App/Models'
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

export default class UserKey extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public userId: number

  @column()
  public key: string

  @column()
  public type: UserKeysType

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime()
  public expiredAt: DateTime

  @belongsTo(() => Users)
  public user: BelongsTo<typeof Users>
}
