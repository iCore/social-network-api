import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
import { User } from 'App/Models'

export default class MainController {
  public async show({ request, response }: HttpContextContract) {
    const { username } = await validator.validate({
      schema: schema.create({
        username: schema.string([
          rules.trim(),
          rules.exists({ column: 'username', table: 'users', where: { is_active: true } })
        ])
      }),
      data: { username: request.param('username') }
    })

    const user = await User.findByOrFail('username', username)

    await user.load('profile')

    response.ok(user)
  }
}
