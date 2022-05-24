import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { User } from 'App/Models'
import { UserInterest } from 'App/Utils/user'
import { DateTime } from 'luxon'

export default class Profile extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column({ serializeAs: null })
  public userId: number

  @column()
  public biography: string

  @column()
  public fullName: string

  @column()
  public interest: UserInterest

  @column.dateTime()
  public birthday: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
