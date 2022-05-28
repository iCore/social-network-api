import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UpdateValidator from 'App/Validators/Authentication/Profile/UpdateValidator'

export default class MainController {
  public async show({ auth, response }: HttpContextContract) {
    const user = auth.user!

    await user.load('profile')

    response.ok(user)
  }

  public async update({ auth, request }: HttpContextContract) {
    const { profile } = await request.validate(UpdateValidator)

    const user = auth.user!

    await user.related('profile').updateOrCreate({}, { ...profile })
  }
}
