import mudawanah, {
  IPlugin,
  IConfig,
  IPost,
  IPage
} from 'mudawanah'
import * as route from 'koa-router'
import * as fs from 'fs'

import { MarkdownIt } from 'markdown-it'

const plugin: IPlugin = {
  async initialize(blog: { routes: route, config: IConfig, posts: IPost[] }) {

  },

  postRender(post: IPost, md: MarkdownIt) {
    if (post.pluginsData && post.pluginsData['school']) {
      // Renderer
      if (post.pluginsData['school'].math) {
        md = md.use(require('markdown-it-math'), {
          inlineOpen: '$%$',
          inlineClose: '$%$',
          blockOpen: '$%$$',
          blockClose: '$$%$'
        })
      }
      if (post.pluginsData['school'].chem) {
        md = md.use(require('markdown-it-mathjax')())
      }

      // Script loading
      if (post.pluginsData['school'].math && !post.pluginsData['school'].chem) {
        post.pluginsData['school'].header = fs.readFileSync(__dirname + '/mathonly.html', 'utf8')
      }
      if (post.pluginsData['school'].math && post.pluginsData['school'].chem) {
        post.pluginsData['school'].header = fs.readFileSync(__dirname + '/both.html', 'utf8')
      }
    }

    return md
  },

  pageRender(page: IPage, md: MarkdownIt) {
    if (page.pluginsData && page.pluginsData['school']) {
      // Renderer
      if (page.pluginsData['school'].math) {
        md = md.use(require('markdown-it-math'), {
          inlineOpen: '%$',
          inlineClose: '$%',
          blockOpen: '%$$',
          blockClose: '$$%'
        })
      }
      if (page.pluginsData['school'].chem) {
        md = md.use(require('markdown-it-mathjax')())
      }

      // Script loading
      if (page.pluginsData['school'].chem) {
        page.pluginsData['school'].header = fs.readFileSync(__dirname + '/both.html', 'utf8')
      }
      if (page.pluginsData['school'].math) {
        page.pluginsData['school'].header = fs.readFileSync(__dirname + '/mathonly.html', 'utf8')
      }
    }

    return md
  }
}

export = plugin
