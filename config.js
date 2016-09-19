module.exports = {
  in: {
    root: './src',
    js: {
      root: '!this[in.root]/js',
      watch: '!this[in.js.root]/**/*.js',
      entry: '!this[in.js.root]/entry.js'
    },
    styles: { 
      root: '!this[in.root]/styles',
      watch: '!this[in.styles.root]/**/*.{scss,sass}',
      entry: '!this[in.styles.root]/entry.scss'
    },
    images: '!this[in.root]/images/**/*.{jpg,jpeg,png,gif}',
    index: '!this[in.root]/index.html',
    pages: {
      root: '!this[in.root]',
      watch: '!this[in.pages.root]/**/*.pug'
    },
  },
  out: {
    root: './dist',
    assets: '!this[out.root]/assets',
    images: '!this[out.assets]/images',
    js: {
      root: '!this[out.assets]',
      bundle: 'bundle.js'
    },
    css: {
      root: '!this[out.assets]',
      bundle: 'bundle.css'
    }
  }
}

