import Route from '@ioc:Adonis/Core/Route'

Route.post('/user/registration', 'Users/RegistrationsController.store')
Route.get('/user/registration/:token', 'Users/RegistrationsController.show')
Route.put('/user/registration/:token', 'Users/RegistrationsController.update')
