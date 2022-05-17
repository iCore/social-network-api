import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new ExpiredTokenException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class ExpiredTokenException extends Exception {
  constructor() {
    super('The token provided is no longer valid', 500, 'E_EXPIRED_TOKEN')
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send(error.message)
  }
}
