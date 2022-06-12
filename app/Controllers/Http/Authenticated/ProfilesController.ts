import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Profile } from 'App/Models'
import UpdateValidator from 'App/Validators/Authenticated/Profile/UpdateValidator'

export default class ProfilesController {
  public async show({ auth, response }: HttpContextContract) {
    const profile = await Profile.findByOrFail('userId', auth.user!.id)

    response.ok(profile)
  }

  public async update({ auth, request }: HttpContextContract) {
    const data = await request.validate(UpdateValidator)

    await Profile.updateOrCreate({ userId: auth.user!.id }, data)
  }
}
