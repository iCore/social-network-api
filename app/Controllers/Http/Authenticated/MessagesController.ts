import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import { Conversation, Message, User } from 'App/Models'
import { StoreValidator } from 'App/Validators/Authenticated/Message'
import { DateTime } from 'luxon'

export default class MessagesController {
  public async store({ auth, request, response }: HttpContextContract) {
    const { username, content } = await request.validate(StoreValidator)

    if (auth.user!.username === username) return response.badRequest()

    const existingConversation: Conversation = await Database.query()
      .from('conversations')
      .where('owner_id', auth.user!.id)
      .orWhere('guest_id', auth.user!.id)
      .first()

    if (existingConversation)
      return await Message.create({
        conversationId: existingConversation.id,
        userId: auth.user!.id,
        content
      })

    const guest = await User.findByOrFail('username', username)
    const conversation = await Conversation.create({ ownerId: auth.user!.id, guestId: guest.id })

    const message = await conversation
      .related('messages')
      .create({ userId: auth.user!.id, content })

    await message.load('user')

    return message.serialize({
      fields: { omit: ['conversationId'] },
      relations: {
        user: { fields: { pick: ['username', 'email'] } }
      }
    })
  }

  public async show({ request }: HttpContextContract) {
    const conversation = await Conversation.findByOrFail('id', request.param('id', 0))

    await conversation.load('messages', (message) => message.preload('user'))

    const { messages } = conversation.serializeRelations({
      messages: {
        fields: { omit: ['conversationId'] },
        relations: {
          user: { fields: { pick: ['username', 'email'] } }
        }
      }
    })

    return messages
  }

  // public async update({ auth, request }: HttpContextContract) {
  //   const { id, content } = await request.validate({
  //     schema: schema.create({
  //       id: schema.number([
  //         rules.trim(),
  //         rules.exists({ column: 'id', table: 'messages', where: { user_id: auth.user!.id } })
  //       ]),
  //       content: schema.string([rules.trim()])
  //     })
  //   })

  //   const message = await Message.findOrFail(id)

  //   await message.merge({ content }).save()

  //   await message.load('user')

  //   return message.serialize({
  //     fields: { omit: ['conversationId'] },
  //     relations: {
  //       user: { fields: { pick: ['username', 'email'] } }
  //     }
  //   })
  // }

  public async destroy({ auth, request, response }: HttpContextContract) {
    const { id } = await request.validate({
      schema: schema.create({
        id: schema.number([
          rules.trim(),
          rules.exists({ column: 'id', table: 'messages', where: { user_id: auth.user!.id } })
        ])
      })
    })

    const message = await Message.findOrFail(id)

    if (message.createdAt > DateTime.now().plus({ minute: 30 })) {
      return response.badRequest()
    }

    await message.delete()
  }
}
