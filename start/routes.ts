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
  await auth.check() // garante que verifica o cookie
  console.log('Usuário autenticado?', auth.isAuthenticated)
  console.log('Usuário atual:', auth.user)

  return view.render('pages/home', { auth })
})

router.resource('/products', ProductsController).as('products')

router.get('/images/:name', [ImagesController, 'show']).as('images.show')

// Rotas de Cadastro
router.get('/register', [AuthController, 'create']).as('register.create')
router.post('/register', [AuthController, 'store']).as('register.store')

router.post('/logout', [AuthController, 'logout']).as('logout')

// start/routes.ts
router.get('/check', async ({ auth }) => {
  if (auth.user) {
    return { logged: true, user: auth.user }
  } else {
    return { logged: false }
  }
})
