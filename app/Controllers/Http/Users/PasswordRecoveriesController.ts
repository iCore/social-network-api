import faker from '@faker-js/faker'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ExpiredTokenException from 'App/Exceptions/ExpiredTokenException'
import PasswordRecovery from 'App/Mailers/PasswordRecovery'
import { User, UserKey } from 'App/Models'
import { StoreValidator, UpdateValidator } from 'App/Validators/Users/PasswordRecovery'
import TokenValidator from 'App/Validators/Users/TokenValidator'
import { DateTime } from 'luxon'

export default class PasswordRecoveriesController {
  public async store({ request, response }: HttpContextContract) {
    const { email, redirectLink } = await request.validate(StoreValidator)

    const user = await User.findByOrFail('email', email)
    const uuid = faker.datatype.uuid()
    const mail = new PasswordRecovery(email)

    await user
      .related('keys')
      .updateOrCreate(
        { type: 'password_recovery' },
        { token: uuid, expiredAt: DateTime.now().plus({ day: 1 }) }
      )

    await user.load('profile')

    await mail
      .content({ resetPasswordLink: `${redirectLink}/${uuid}`, fullName: user.profile.fullName })
      .send()

    return response.ok('')
  }

  public async show({ request, response }: HttpContextContract) {
    const token = await TokenValidator.validate(request, 'password_recovery')

    const userKey = await UserKey.findByOrFail('token', token)

    if (DateTime.now() > userKey.expiredAt) {
      throw new ExpiredTokenException()
    }

    await userKey.load('user')

    await userKey.user.load('profile')

    response.ok(
      userKey.user.serialize({
        fields: { pick: ['email'] },
        relations: { profile: { fields: { pick: ['full_name'] } } }
      })
    )
  }

  public async update({ request, response }: HttpContextContract) {
    const { password } = await request.validate(UpdateValidator)

    const token = await TokenValidator.validate(request, 'password_recovery')

    const userKey = await UserKey.findByOrFail('token', token)

    if (DateTime.now() > userKey.expiredAt) {
      throw new ExpiredTokenException()
    }

    await userKey.load('user')

    await userKey.user.merge({ password }).save()

    await userKey.delete()

    return response.ok('')
  }
}
