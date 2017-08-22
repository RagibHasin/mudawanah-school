import mudawanah, {
  IPlugin,
  IConfig,
  IPost,
  IPage
} from 'mudawanah'
import * as route from 'koa-router'
import * as mjx from 'mathjax-node'
import * as dAsync from 'deasync'
const cleanCss: any = require('clean-css')
import { MarkdownIt } from 'markdown-it'

namespace MudawanahSchool {
  export interface Options {
    asciimath?: string[] | null
    texInline?: string[] | null
    texBlock?: string[] | null
  }
}

class MudawanahSchool implements IPlugin {

  postRender = this.contextRender
  pageRender = this.contextRender

  private ccss = new cleanCss({ level: 2 })
  private asciimath: string[] | null = ['%%', '%%']
  private texInline: string[] | null = ['$$', '$$']
  private texBlock: string[] | null = ['$$$', '$$$']

  private static replace_math(format: string, delims: string[], type: 'TeX' | 'inline-TeX' | 'AsciiMath' | 'MathML'): {
    html: string
    css: string
  } {
    const idx1 = format.indexOf(delims[0])
    if (idx1 !== -1) {
      const idx2 = format.indexOf(delims[1], idx1 + delims[0].length)
      if (idx2 !== -1) {
        let result: mjx.Result = { html: '', css: '' }, done = false
        mjx.typeset({
          math: format.substring(idx1 + delims[0].length, idx2),
          format: type,
          html: true,
          css: true
        }, function (res) {
          result = res
          done = true
        })
        dAsync.loopWhile(() => !done)
        const forward = this.replace_math(format.substr(idx2 + delims[1].length), delims, type)
        if (!result.html) { result.html = '' }
        return {
          html: format.substring(0, idx1 - 1) + result.html + forward.html,
          css: result.css + forward.css
        }
      } else {
        return { html: format, css: '' }
      }
    } else {
      return { html: format, css: '' }
    }
  }

  constructor(options?: MudawanahSchool.Options) {
    if (options) {
      if (options.asciimath !== undefined && (options.asciimath === null ||
        options.asciimath.length !== 0)) {
        this.asciimath = options.asciimath
        if (this.asciimath && this.asciimath.length === 1) {
          this.asciimath[1] = this.asciimath[0]
        }
      }
      if (options.texInline !== undefined && (options.texInline === null ||
        options.texInline.length !== 0)) {
        this.texInline = options.texInline
        if (this.texInline && this.texInline.length === 1) {
          this.texInline[1] = this.texInline[0]
        }
      }
      if (options.texBlock !== undefined && (options.texBlock === null ||
        options.texBlock.length !== 0)) {
        this.texBlock = options.texBlock
        if (this.texBlock && this.texBlock.length === 1) {
          this.texBlock[1] = this.texBlock[0]
        }
      }
    }
  }

  private contextRender(ctx: IPage | IPost, md: MarkdownIt) {
    if (ctx.pluginsData && ctx.pluginsData['school']) {
      /*const
        asciimath = ctx.pluginsData['school'].asciimath === undefined ? this.asciimath :
          ctx.pluginsData['school'].asciimath,
        texBlock = ctx.pluginsData['school'].texBlock === undefined ? this.texBlock :
          ctx.pluginsData['school'].texBlock,
        texInline = ctx.pluginsData['school'].texInline === undefined ? this.texInline :
          ctx.pluginsData['school'].texInline
          */
      let css = ''

      function do_replace_math(type: 'TeX' | 'inline-TeX' | 'AsciiMath' | 'MathML',
        delimsThis: string[] | null, delimsCtx?: string[] | null) {

        if (delimsCtx != null) {
          if (delimsCtx.length === 1) {
            delimsCtx[1] = delimsCtx[0]
          }
          const res = MudawanahSchool.replace_math(ctx.md, delimsCtx, type)
          ctx.md = res.html
          css += res.css
        } else if (delimsCtx === undefined && delimsThis) {
          const res = MudawanahSchool.replace_math(ctx.md, delimsThis, type)
          ctx.md = res.html
          css += res.css
        }
      }

      do_replace_math('AsciiMath', this.asciimath, ctx.pluginsData['school'].asciimath)
      do_replace_math('TeX', this.texBlock, ctx.pluginsData['school'].texBlock)
      do_replace_math('inline-TeX', this.texInline, ctx.pluginsData['school'].texInline)

      css = this.ccss.minify(css).style

      if (css.length !== 0) {
        ctx.pluginsData['school'].header = `<style>${css}</style>`
      }
    }

    return md
  }

  initialize(blog: { routes: route, config: IConfig, posts: IPost[] }) {
    return Promise.resolve()
  }
}

export = MudawanahSchool
