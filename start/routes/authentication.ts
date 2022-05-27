import Route from '@ioc:Adonis/Core/Route'

Route.post('authentication', 'Authentication/MainsController.store')
Route.delete('authentication', 'Authentication/MainsController.destroy').middleware('auth')
