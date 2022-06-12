import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { userInterests, usersAbout } from 'App/Utils/user'

export default class UpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    username: schema.string.optional([
      rules.trim(),
      rules.unique({ column: 'username', table: 'users' })
    ]),
    password: schema.string.optional([
      rules.trim(),
      rules.minLength(8),
      rules.confirmed('passwordConfirmation')
    ]),
    profile: schema.object.optional().members({
      biography: schema.string.optional([rules.trim()]),
      fullName: schema.string.optional([rules.trim()]),
      birthday: schema.date.optional(),
      interest: schema.enum.optional(userInterests, [rules.trim()])
    }),
    about: schema.array.optional().members(
      schema.object.optional().members({
        type: schema.enum(usersAbout),
        description: schema.string.optional(),
        since: schema.date.optional(),
        until: schema.date.optional()
      })
    )
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {}
}
