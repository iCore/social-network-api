import Drive from '@ioc:Adonis/Core/Drive'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UpdateValidator from 'App/Validators/Users/Authenticated/Avatar/UpdateValidator'

export default class AvatarsController {
  public async update({ auth, request, response }: HttpContextContract) {
    const { avatar } = await request.validate(UpdateValidator)
    const user = await auth.user!
    const filePath = `avatar/${user.username}`

    await Drive.put(filePath, avatar.tmpPath!)

    const url = await Drive.getUrl(filePath)

    await user.related('profile').updateOrCreate({}, { avatar: url })

    response.ok({ avatar: url })
  }

  public async destroy({ auth }: HttpContextContract) {
    const user = auth.user!

    await user.load('profile')

    if (await Drive.exists(user.profile.avatar)) {
      await Drive.delete(user.profile.avatar)
    }
  }
}
