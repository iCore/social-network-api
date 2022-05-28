import Route from '@ioc:Adonis/Core/Route'

Route.post('authentication', 'AuthenticationsController.store')
Route.delete('authentication', 'AuthenticationsController.destroy').middleware('auth')
