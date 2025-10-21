/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const ProductsController = () => import('#controllers/products_controller')
const ImagesController = () => import('#controllers/images_controller')
const AuthController = () => import('#controllers/auth_controller')

router.get('/', async ({ view, auth }) => {
  await auth.check()
  return view.render('pages/home', { auth, title: 'Home' })
})
router.resource('/products', ProductsController).as('products')

router.get('/images/:name', [ImagesController, 'show']).as('images.show')

// Rotas de Cadastro
router.get('/register', [AuthController, 'create']).as('register.create')
router.post('/register', [AuthController, 'store']).as('register.store')
router.post('/logout', async ({ auth, response }) => {
  await auth.use('web').logout()
  return response.redirect('/')
})
