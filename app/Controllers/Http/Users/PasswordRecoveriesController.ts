import faker from '@faker-js/faker'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ExpiredTokenException from 'App/Exceptions/ExpiredTokenException'
import PasswordRecovery from 'App/Mailers/PasswordRecovery'
import { User, UserKey } from 'App/Models'
import { StoreValidator, UpdateValidator } from 'App/Validators/Users/PasswordRecovery'
import TokenValidator from 'App/Validators/Users/TokenValidator'
import { DateTime } from 'luxon'

export default class PasswordRecoveriesController {
  public async store({ request }: HttpContextContract) {
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
  }

  public async show({ request, response }: HttpContextContract) {
    const token = await TokenValidator.validate(request, 'password_recovery')

    const key = await UserKey.findByOrFail('token', token)

    if (DateTime.now() > key.expiredAt) {
      throw new ExpiredTokenException()
    }

    await key.load('user')

    await key.user.load('profile')

    response.ok({
      expiredAt: key.expiredAt,
      ...key.user.serialize({
        fields: { pick: ['email'] },
        relations: { profile: { fields: { pick: ['fullName'] } } }
      })
    })
  }

  public async update({ request }: HttpContextContract) {
    const { password } = await request.validate(UpdateValidator)

    const token = await TokenValidator.validate(request, 'password_recovery')

    const key = await UserKey.findByOrFail('token', token)

    if (DateTime.now() > key.expiredAt) {
      throw new ExpiredTokenException()
    }

    await key.load('user')

    await key.user.merge({ password }).save()

    await key.delete()
  }
}
