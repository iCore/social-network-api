import Route from '@ioc:Adonis/Core/Route'

Route.post('registration', 'Users/RegistrationsController.store')
Route.get('registration/:token', 'Users/RegistrationsController.show')
Route.put('registration/:token', 'Users/RegistrationsController.update')

Route.post('password-recovery', 'Users/PasswordREcoveriesController.store')
Route.get('password-recovery/:token', 'Users/PasswordREcoveriesController.show')
Route.put('password-recovery/:token', 'Users/PasswordREcoveriesController.update')

Route.get('user/:username', 'Users/MainController.show').middleware('auth')

Route.get('profile', 'Authenticated/MainController.show').middleware('auth')
Route.put('profile', 'Authenticated/MainController.update').middleware('auth')
Route.delete('profile', 'Authenticated/MainController.destroy').middleware('auth')

Route.put('avatar', 'Authenticated/AvatarsController.update').middleware('auth')
Route.delete('avatar', 'Authenticated/AvatarsController.destroy').middleware('auth')
