import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { About } from 'App/Models'
import UpdateValidator from 'App/Validators/Authenticated/About/UpdateValidator'

export default class AboutController {
  public async show({ auth, response }: HttpContextContract) {
    await auth.user!.load('profile')

    const about = await About.findMany([auth.user!.profile.id])

    response.ok(about)
  }

  public async update({ auth, request }: HttpContextContract) {
    const { about } = await request.validate(UpdateValidator)

    const data = [] as Array<{}>

    about.forEach((element) => data.push({ ...element }))

    await auth.user!.load('profile')

    await auth.user!.profile.related('about').updateOrCreateMany(data, 'type')
  }
}
