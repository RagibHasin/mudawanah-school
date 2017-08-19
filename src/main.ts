import mudawanah, {
  IPlugin,
  IConfig,
  IPost,
  IPage
} from 'mudawanah'
import * as route from 'koa-router'
import * as fs from 'fs'

import { MarkdownIt } from 'markdown-it'

function contextRender(ctx: IPage | IPost, md: MarkdownIt) {
  if (ctx.pluginsData && ctx.pluginsData['school']) {
    // Renderer
    if (ctx.pluginsData['school'].math) {
      md = md.use(require('markdown-it-math'), {
        inlineOpen: '%$',
        inlineClose: '$%',
        blockOpen: '%$$',
        blockClose: '$$%'
      })
    }
    if (ctx.pluginsData['school'].chem) {
      md = md.use(require('markdown-it-mathjax')())
    }

    // Script loading
    if (ctx.pluginsData['school'].chem) {
      ctx.pluginsData['school'].header = fs.readFileSync(__dirname + '/both.html', 'utf8')
    }
    if (ctx.pluginsData['school'].math) {
      ctx.pluginsData['school'].header = fs.readFileSync(__dirname + '/mathonly.html', 'utf8')
    }
  }

  return md
}

const plugin: IPlugin = {
  async initialize(blog: { routes: route, config: IConfig, posts: IPost[] }) { },
  postRender: contextRender,
  pageRender: contextRender
}

export = plugin
