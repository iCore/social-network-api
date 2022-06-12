import Route from '@ioc:Adonis/Core/Route'

Route.post('registration', 'Users/RegistrationsController.store')
Route.get('registration/:token', 'Users/RegistrationsController.show')
Route.put('registration/:token', 'Users/RegistrationsController.update')

Route.post('password-recovery', 'Users/PasswordREcoveriesController.store')
Route.get('password-recovery/:token', 'Users/PasswordREcoveriesController.show')
Route.put('password-recovery/:token', 'Users/PasswordREcoveriesController.update')

Route.get('user/main', 'Authenticated/MainController.show').middleware('auth')
Route.put('user/main', 'Authenticated/MainController.update').middleware('auth')
Route.delete('user/main', 'Authenticated/MainController.destroy').middleware('auth')

Route.get('user/profile', 'Authenticated/ProfilesController.show').middleware('auth')
Route.put('user/profile', 'Authenticated/ProfilesController.update').middleware('auth')

Route.get('user/about', 'Authenticated/AboutController.show').middleware('auth')
Route.put('user/about', 'Authenticated/AboutController.update').middleware('auth')

Route.put('user/avatar', 'Authenticated/AvatarsController.update').middleware('auth')
Route.delete('user/avatar', 'Authenticated/AvatarsController.destroy').middleware('auth')

Route.get('user/:username', 'Users/MainController.show').middleware('auth')
