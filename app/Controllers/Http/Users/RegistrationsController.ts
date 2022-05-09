import { User, UserKey } from 'App/Models'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ShowValidator, StoreValidator, UpdateValidator } from 'App/Validators/Users/Registration'
import faker from '@faker-js/faker'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class RegistrationsController {
  public async store({ request, response }: HttpContextContract) {
    const { fullName, email, redirectLink } = await request.validate(StoreValidator)

    const uuid = faker.datatype.uuid()

    const user = await User.firstOrCreate({ email, isActive: false }, {})

    await user.related('profile').updateOrCreate({}, { fullName })

    await user.related('keys').updateOrCreate({ type: 'registration' }, { key: uuid })

    await Mail.send((message) => {
      message.to(email)
      message.from(email, 'Social Network')
      message.subject('Account creation')
      message.htmlView('account_confirmation', { activation_link: `${redirectLink}/${uuid}` })
    })

    return response.ok('')
  }

  public async show({ request, response }: HttpContextContract) {
    const { token } = await ShowValidator(request.param('token', ''))

    const userKeys = await UserKey.findByOrFail('key', token)

    await userKeys.load('user')

    await userKeys.user.load('profile')

    response.ok(
      userKeys.user.serialize({
        fields: { pick: ['email'] },
        relations: { Profile: { fields: { pick: ['fullName'] } } }
      })
    )
  }

  public async update({ request, response }: HttpContextContract) {
    const { username, password, token } = await request.validate(UpdateValidator)

    const userKey = await UserKey.findByOrFail('key', token)

    await userKey.load('user')

    await userKey.user.merge({ username, password, isActive: true }).save()

    await userKey.delete()

    return response.ok('')
  }
}
