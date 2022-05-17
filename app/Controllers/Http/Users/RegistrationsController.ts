import faker from '@faker-js/faker'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AccountActivation from 'App/Mailers/AccountActivation'
import { User, UserKey } from 'App/Models'
import { StoreValidator, UpdateValidator } from 'App/Validators/Users/Registration'
import TokenValidator from 'App/Validators/Users/TokenValidator'

export default class RegistrationsController {
  public async store({ request, response }: HttpContextContract) {
    const { fullName, email, redirectLink } = await request.validate(StoreValidator)
    const uuid = faker.datatype.uuid()
    const mail = new AccountActivation(email)

    const user = await User.firstOrCreate({ email, isActive: false }, {})

    await user.related('profile').updateOrCreate({}, { fullName })

    await user.related('keys').updateOrCreate({ type: 'registration' }, { token: uuid })

    await mail.content({ activationLink: `${redirectLink}/${uuid}`, fullName }).send()

    return response.ok('')
  }

  public async show({ request, response }: HttpContextContract) {
    const token = await TokenValidator.validate(request, 'registration')

    const userKey = await UserKey.findByOrFail('token', token)

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
    const { username, password } = await request.validate(UpdateValidator)

    const token = await TokenValidator.validate(request, 'registration')

    const userKey = await UserKey.findByOrFail('token', token)

    await userKey.load('user')

    await userKey.user.merge({ username, password, isActive: true }).save()

    await userKey.delete()

    return response.ok('')
  }
}
