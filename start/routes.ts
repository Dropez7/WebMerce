import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ProductsController = () => import('#controllers/products_controller')
const ImagesController = () => import('#controllers/images_controller')
const ProfileController = () => import('#controllers/profiles_controller')
const AuthController = () => import('#controllers/auth_controller')
const PaymentsController = () => import('#controllers/payments_controller')
const CartController = () => import('#controllers/cart_controller')

router
  .get('/', async ({ view }) => {
    const Product = (await import('#models/product')).default
    const products = await Product.query().preload('images').limit(8)
    return view.render('pages/home', { title: 'Home', products })
  })
  .as('home')

router.get('/products', [ProductsController, 'index']).as('products.index')
router
  .get('/products/:id', [ProductsController, 'show'])
  .where('id', router.matchers.number())
  .as('products.show')

router
  .group(() => {
    router.get('/products/create', [ProductsController, 'create']).as('products.create')
    router.get('/products/:id/edit', [ProductsController, 'edit']).as('products.edit')
    router.post('/products', [ProductsController, 'store']).as('products.store')
    router.put('/products/:id', [ProductsController, 'update']).as('products.update')
    router.delete('/products/:id', [ProductsController, 'destroy']).as('products.destroy')
  })
  .use(middleware.auth())
  .use(middleware.admin())

router.get('/register', [AuthController, 'create']).as('register.create').use(middleware.guest())
router.post('/register', [AuthController, 'store']).as('register.store').use(middleware.guest())

router
  .post('/logout', async ({ auth, response }) => {
    await auth.use('web').logout()
    return response.redirect('/')
  })
  .as('logout')
  .use(middleware.auth())

router.get('/login', [AuthController, 'showLogin']).as('login.show').use(middleware.guest())
router.post('/login', [AuthController, 'storeLogin']).as('login.store').use(middleware.guest())

router
  .group(() => {
    router.get('/profile', [ProfileController, 'edit']).as('profile.edit')
    router.put('/profile', [ProfileController, 'update']).as('profile.update')
  })
  .use(middleware.auth())

router.get('/images/:name', [ImagesController, 'show']).as('images.show')
router.get('/avatars/:filename', [ImagesController, 'showAvatar']).as('avatars.show')

router.group(() => {}).use(middleware.auth())

// Adicione isto no start/routes.ts, fora do grupo 'admin'

router
  .group(() => {
    // Carrinho de compras
    router.get('/cart', [CartController, 'index']).as('cart.index')
    router.post('/cart', [CartController, 'store']).as('cart.store')
    router.delete('/cart/:id', [CartController, 'destroy']).as('cart.destroy')

    router.get('/checkout/cart', [PaymentsController, 'checkoutCart']).as('checkout.cart')

    router.post('/checkout/cart', [PaymentsController, 'processCart']).as('checkout.cart_process')

    // Processamento de pagamentos individuais
    router.get('/checkout/:id', [PaymentsController, 'show']).as('checkout.show')
    router.post('/checkout/:id', [PaymentsController, 'process']).as('checkout.process')
    router.get('/checkout/:id/result', [PaymentsController, 'result']).as('checkout.result')
  })
  .use(middleware.auth())
