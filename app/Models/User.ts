import Hash from '@ioc:Adonis/Core/Hash'
import {
  BaseModel,
  beforeSave,
  column,
  HasMany,
  hasMany,
  HasOne,
  hasOne
} from '@ioc:Adonis/Lucid/Orm'
import { Conversation, Profile, UserKey } from 'App/Models'
import { UserRole } from 'App/Utils/user'
import { DateTime } from 'luxon'

export default class User extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public role: UserRole

  @column()
  public isActive: boolean

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public disabledAt: DateTime

  @beforeSave()
  public static async hashPassword(users: User) {
    if (users.$dirty.password) {
      users.password = await Hash.make(users.password)
    }
  }

  @hasMany(() => UserKey)
  public keys: HasMany<typeof UserKey>

  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>

  @hasMany(() => Conversation)
  public conversation: HasMany<typeof Conversation>
}
