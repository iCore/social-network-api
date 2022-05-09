import Route from '@ioc:Adonis/Core/Route'

Route.post('registration', 'Users/RegistrationsController.store')
Route.get('registration/:token', 'Users/RegistrationsController.show')
Route.put('registration/:token', 'Users/RegistrationsController.update')
