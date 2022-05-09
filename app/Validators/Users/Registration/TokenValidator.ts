import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'

export default class TokenValidator {
  public static async validate(request) {
    const data = await validator.validate({
      schema: schema.create({
        token: schema.string([
          rules.trim(),
          rules.uuid(),
          rules.exists({ column: 'token', table: 'user_keys' })
        ])
      }),
      data: { token: request.param('token') }
    })

    return data.token
  }
}
