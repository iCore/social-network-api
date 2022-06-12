import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UpdateValidator from 'App/Validators/Authenticated/Profile/UpdateValidator'

export default class ProfilesController {
  public async show({ auth, response }: HttpContextContract) {
    await auth.user!.load('profile')

    response.ok(auth.user!.profile)
  }

  public async update({ auth, request }: HttpContextContract) {
    const data = await request.validate(UpdateValidator)

    await auth.user!.related('profile').updateOrCreate({}, data)
  }
}
