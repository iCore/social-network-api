import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdminsOnly {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    if (auth.user!.role === 'normal' || auth.user!.role === 'moderator')
      return response.unauthorized({
        error: 'You do not have sufficient permission to access this resource.'
      })

    await next()
  }
}
