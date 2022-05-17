import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import View from '@ioc:Adonis/Core/View'
import mjml from 'mjml'

export default class PasswordRecovery extends BaseMailer {
  constructor(email) {
    super()

    this.email = email
  }

  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  private email: string

  private data: {
    resetPasswordLink: string
    fullName: string
  }

  public content(data: typeof this.data) {
    this.data = data
    return this
  }

  /**
   * The prepare method is invoked automatically when you run
   * "PasswordRecovery.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public async prepare(message: MessageContract) {
    const html = await View.render('emails/password-recovery', this.data)

    message
      .subject('Password recovery')
      .from('noreply@social-network.api', 'Social Network')
      .to(this.email, this.data.fullName)
      .html(mjml(html).html)
  }
}
