# bind-date

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your tests

```
npm run test
```

### Lints and fixes files

```
npm run lint
```

### build 优化方案

- 将库文件通过 CDN 方式引入，减少 vendor 文件的体积。完整流程：
  1. 在 `public/indx.html` 文件中将 `vue、vue-router、axios` 等第三方库的 JS 文件和 CSS 文件通过 `script` 标签和 `link` 标签的方式引入
  2. 在 `vue.config.js` 文件中配置 `configureWebpack` 中的 `externals` 字段，将那些不打包到 vendor 中的包声明一下
  3. 然后在代码中通过别名，也就是 `externals` 对象中的 key 直接引入包名即可
- 通过 webpack 插件 `compression-webpack-plugin` 对文件进行 GZIP 压缩

