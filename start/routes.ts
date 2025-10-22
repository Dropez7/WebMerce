/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ProductsController = () => import('#controllers/products_controller')
const ImagesController = () => import('#controllers/images_controller')
const ProfileController = () => import('#controllers/profiles_controller')
const AuthController = () => import('#controllers/auth_controller')

// Rota de GET
router
  .get('/', async ({ view, auth }) => {
    await auth.check()
    return view.render('pages/home', { auth, title: 'Home' })
  })
  .as('home')

// Rotas de Produtos
router.resource('/products', ProductsController).as('products')

// Rota de Imagens
router.get('/images/:name', [ImagesController, 'show']).as('images.show')

// Rotas de Cadastro
router.get('/register', [AuthController, 'create']).as('register.create').use(middleware.guest())
router.post('/register', [AuthController, 'store']).as('register.store').use(middleware.guest())

// Rotas de Logout
router
  .post('/logout', async ({ auth, response }) => {
    await auth.use('web').logout()
    return response.redirect('/')
  })
  .as('logout')
  .use(middleware.auth())

// Rotas de Login
router.get('/login', [AuthController, 'showLogin']).as('login.show').use(middleware.guest())
router.post('/login', [AuthController, 'storeLogin']).as('login.store').use(middleware.guest())

router
  .group(() => {
    router.get('/profile', [ProfileController, 'edit']).as('profile.edit')
    router.put('/profile', [ProfileController, 'update']).as('profile.update') // Usar PUT para atualização
  })
  .use(middleware.auth())

router.get('/avatars/:filename', [ImagesController, 'showAvatar']).as('avatars.show') // <--- Verifique esta linha
