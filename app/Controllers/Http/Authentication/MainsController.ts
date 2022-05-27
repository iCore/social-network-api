import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StoreValidator from 'App/Validators/Authentication/Main/StoreValidator'

export default class MainsController {
  public async store({ auth, request, response }: HttpContextContract) {
    const { email, password } = await request.validate(StoreValidator)

    const session = await auth.use('api').attempt(email, password)

    response.ok(session)
  }

  public async destroy({ auth }: HttpContextContract) {
    await auth.logout()
  }
}
