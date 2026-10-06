import 'reflect-metadata'
import { Ignitor } from '@adonisjs/core'

const APP_ROOT = new URL('../build/', import.meta.url)

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

// Inicializa a aplicação uma única vez fora do handler
const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER })
const app = ignitor.createApp('web')

await app.init()
await app.boot()

const server = await app.container.make('server')
await server.boot()

export default async function handler(req: any, res: any) {
  return server.handle(req, res)
}