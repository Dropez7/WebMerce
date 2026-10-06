// api/index.ts
import 'reflect-metadata'
import { Ignitor } from '@adonisjs/core'

// Pasta onde o comando `node ace build` coloca o código transpilado
const APP_ROOT = new URL('../build/', import.meta.url)

// Importer que resolve arquivos a partir da pasta de *build*
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

/* -------------------------------------------------
   Inicializa a aplicação **uma única vez** (fora do handler)
   ------------------------------------------------- */
const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER })
const app = ignitor.createApp('web')
await app.init()
await app.boot()

// O servidor HTTP já está criado e bootado
const server = await app.container.make('server')
await server.boot()

// -------------------------------------------------
// Vercel invoca este handler a cada requisição
export default async function handler(req: any, res: any) {
  return server.handle(req, res)   // método `handle` existe aqui
}