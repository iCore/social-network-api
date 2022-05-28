import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UpdateValidator from 'App/Validators/Authentication/Profile/UpdateValidator'

export default class ProfilesController {
  public async show({ auth, response }: HttpContextContract) {
    const user = auth.user!

    await user.load('profile')

    response.ok(user)
  }

  public async update({ auth, request }: HttpContextContract) {
    const { biography, birthday, fullName, interest } = await request.validate(UpdateValidator)

    await auth.user!.profile.merge({ biography, birthday, fullName, interest }).save()
  }
}
