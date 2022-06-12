import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { Profile } from 'App/Models'
import { UserAbout } from 'App/Utils/user'
import { DateTime } from 'luxon'

export default class About extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public profileId: number

  @column()
  public type: UserAbout

  @column()
  public description: string

  @column.dateTime()
  public since: DateTime

  @column.dateTime()
  public until: DateTime

  @belongsTo(() => Profile)
  public profile: BelongsTo<typeof Profile>
}
