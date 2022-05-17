import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { UserKeysType } from 'App/Utils/user'

export default class TokenValidator {
  public static async validate(request, type: UserKeysType) {
    const data = await validator.validate({
      schema: schema.create({
        token: schema.string([
          rules.trim(),
          rules.uuid(),
          rules.exists({ column: 'token', table: 'user_keys', where: { type } })
        ])
      }),
      data: { token: request.param('token') }
    })

    return data.token
  }
}
