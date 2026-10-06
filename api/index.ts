// api/index.ts

import { Ignitor } from '@adonisjs/core'

// Pasta onde o comando `node ace build` coloca o código transpilado
const APP_ROOT = new URL('../build/', import.meta.url)

// Importer que resolve arquivos a partir da pasta de *build*
const IMPORTER = (filePath: string) => {
  // Resolve relative paths (./ or ../) directly
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  // Resolve Adonis alias paths that start with '#'
  if (filePath.startsWith('#')) {
    // Remove leading '#', append .js (compiled files are .js in build folder)
    const cleaned = filePath.slice(1) + '.js'
    return import(new URL(cleaned, APP_ROOT).href)
  }
  // Fallback – let Node try standard resolution (should not happen for our aliases)
  return import(filePath)
}

/* -------------------------------------------------
   Inicializa a aplicação **uma única vez** (fora do handler)
   ------------------------------------------------- */
const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER })
const app = ignitor.createApp('web')
await app.init()
await app.boot()
await import('#start/routes')

// O servidor HTTP já está criado e bootado
const server = await app.container.make('server')
await server.boot()

// -------------------------------------------------
// Vercel invoca este handler a cada requisição
export default async function handler(req: any, res: any) {
  return server.handle(req, res)   // método `handle` existe aqui
}