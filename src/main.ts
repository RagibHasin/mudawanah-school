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
import { EOL } from 'os'

namespace MudawanahSchool {
  export interface Options {
    asciimath?: string[] | null
    asciimathMulti?: string[] | null
    texInline?: string[] | null
    texMultiline?: string[] | null
    texBlock?: string[] | null
    css?: string
  }
}

class MudawanahSchool implements IPlugin {

  postRender = this.contextRender
  pageRender = this.contextRender

  private ccss = new cleanCss({ level: 2 })
  private asciimath: string[] | null = ['%%', '%%']
  private asciimathMulti: string[] | null = null
  private texInline: string[] | null = ['$$', '$$']
  private texMultiline: string[] | null = null
  private texBlock: string[] | null = ['$$$', '$$$']
  private additionalCss = `.MathJax { font-size: 1.27em; }`

  private static replace_math(format: string, delims: string[],
    type: 'TeX' | 'inline-TeX' | 'AsciiMath', multiline: boolean = false): {
      html: string
      css: string
    } {
    const idx1 = format.indexOf(delims[0])
    if (idx1 !== -1) {
      const idx2 = format.indexOf(delims[1], idx1 + delims[0].length)
      if (idx2 !== -1) {
        if (!multiline) {
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
          let html = '', css = ''
          const lines = format.substring(idx1 + delims[0].length, idx2).split(EOL)
          for (const line of lines) {
            let done = false
            mjx.typeset({
              math: line,
              format: type,
              html: true,
              css: true
            }, function (res) {
              html += res.html + '<br>'
              css += res.css
              done = true
            })
            dAsync.loopWhile(() => !done)
          }
          html = html.substr(0, html.length - 4)
          const forward = this.replace_math(format.substr(idx2 + delims[1].length), delims, type)
          return {
            html: format.substring(0, idx1 - 1) + html + forward.html,
            css: css + forward.css
          }
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
      if (options.asciimathMulti && options.asciimathMulti.length !== 0) {
        this.asciimathMulti = options.asciimathMulti
        if (this.asciimathMulti.length === 1) {
          this.asciimathMulti[1] = this.asciimathMulti[0]
        }
      }
      if (options.texMultiline && options.texMultiline.length !== 0) {
        this.texMultiline = options.texMultiline
        if (this.texMultiline.length === 1) {
          this.texMultiline[1] = this.texMultiline[0]
        }
      }
      if (options.css) {
        this.additionalCss = options.css
      }
    }
  }

  private contextRender(ctx: IPage | IPost, md: MarkdownIt) {
    if (ctx.pluginsData && ctx.pluginsData['school']) {
      let css = ''

      function do_replace_math(type: 'TeX' | 'inline-TeX' | 'AsciiMath',
        delimsThis: string[] | null, delimsCtx?: string[] | null) {

        if (delimsCtx) {
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

      if (css.length !== 0) {
        ctx.pluginsData['school'].header = `<style>${this.ccss.minify(css).styles}</style>`
      }
    }

    return md
  }

  initialize(blog: { routes: route, config: IConfig, posts: IPost[] }) {
    return Promise.resolve()
  }
}

export = MudawanahSchool
