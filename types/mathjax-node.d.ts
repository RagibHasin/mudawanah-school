declare module 'mathjax-node' {

  interface Data {
    ex?: number,                    // ex-size in pixels
    width?: number,                 // width of container (in ex) for linebreaking and tags
    useFontCache?: boolean,         // use <defs> and <use> in svg output?
    useGlobalCache?: true,          // use common <defs> for all equations?
    linebreaks?: boolean,           // automatic linebreaking
    equationNumbers?: "none" | "AMS" | "all",
    // automatic equation numbering ("none", "AMS" or "all")
    math: string,                   // the math string to typeset
    format?: "TeX" | "inline-TeX" | "AsciiMath" | "MathML",
    // the input format (TeX, inline-TeX, AsciiMath, or MathML)
    xmlns?: string,                 // the namespace to use for MathML

    html?: boolean,                 // generate HTML output
    htmlNode?: boolean,             // generate HTML output as jsdom node
    css?: boolean,                  // generate CSS for HTML output
    mml?: boolean,                  // generate MathML output
    mmlNode?: boolean,              // generate MathML output as jsdom node
    svg?: boolean,                  // generate SVG output
    svgNode?: boolean,              // generate SVG output as jsdom node

    speakText?: boolean,            // add textual alternative (for TeX/asciimath the input string, for MathML a dummy string)

    state?: any,                    // an object to store information from multiple calls (e.g., <defs> if useGlobalCache, counter for equation numbering if equationNumbers ar )
    timeout?: number                // 10 second timeout before restarting MathJax
  }

  interface Result {
    errors?: string[]            // an array of MathJax error messages if any errors occurred
    mml?: string                 // a string of MathML markup if requested
    mmlNode?: any                // a jsdom node of MathML markup if requested
    html?: string                // a string of HTML markup if requested
    htmlNode?: any               // a jsdom node of HTML markup if requested
    css?: string                 // a string of CSS if HTML was requested
    svg?: string                 // a string of SVG markup if requested
    svgNode?: any                // a jsdom node of SVG markup if requested
    style?: string               // a string of CSS inline style if SVG requested
    height?: string              // a string containing the height of the SVG output if SVG was requested
    width?: string               // a string containing the width of the SVG output if SVG was requested
    speakText?: string           // a string of speech text if requested

    state?: {                    // the state object (if useGlobalCache or equationNumbers is set)
      glyphs?: any               // a collection of glyph data
      defs?: string              // a string containing SVG def elements
      AMS?: {
        startNumber?: number     // the current starting equation number
        labels?: string[]        // the set of labels
        IDs?: string[]           // IDs used in previous equations
      }
    }
  }

  export function config(options?: {
    displayMessages?: boolean,       // determines whether Message.Set() calls are logged
    displayErrors?: boolean,         // determines whether error messages are shown on the console
    undefinedCharError?: boolean,    // determines whether "unknown characters" (i.e., no glyph in the configured fonts) are saved in the error array
    extensions?: string | string[],  // a convenience option to add MathJax extensions
    fontURL?: string,                // for webfont urls in the CSS for HTML output
    MathJax?: any
  }): void

  export function start(): void

  export function typeset(data: Data, callback: (result: Result, data?: Data) => void): void
}
