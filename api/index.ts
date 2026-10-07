import 'reflect-metadata'
import { Ignitor } from '@adonisjs/core'

const APP_ROOT = new URL('../build/', import.meta.url)

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('#')) {
    const cleaned = filePath.slice(1) + '.js'
    return import(new URL(cleaned, APP_ROOT).href)
  }
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER })
const app = ignitor.createApp('web')

await app.init()
await app.boot()

// Importa as rotas compiladas dentro de build/start/routes.js
await import(new URL('start/routes.js', APP_ROOT).href)

const server = await app.container.make('server')
await server.boot()

export default async function handler(req: any, res: any) {
  return server.handle(req, res)
}