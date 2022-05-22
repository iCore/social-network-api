import Route from '@ioc:Adonis/Core/Route'

Route.post('registration', 'Users/RegistrationsController.store')
Route.get('registration/:token', 'Users/RegistrationsController.show')
Route.put('registration/:token', 'Users/RegistrationsController.update')

Route.post('password-recovery', 'Users/PasswordREcoveriesController.store')
Route.get('password-recovery/:token', 'Users/PasswordREcoveriesController.show')
Route.put('password-recovery/:token', 'Users/PasswordREcoveriesController.update')
