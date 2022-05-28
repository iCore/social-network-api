import Route from '@ioc:Adonis/Core/Route'

Route.post('authentication', 'Authentication/MainsController.store')
Route.delete('authentication', 'Authentication/MainsController.destroy').middleware('auth')

Route.get('authentication', 'Authentication/ProfilesController.show').middleware('auth')
Route.put('authentication', 'Authentication/ProfilesController.update').middleware('auth')
