const path = require('path')
const assetsDir = 'assets'
// const CompressionPlugin = require('compression-webpack-plugin')
module.exports = {
  productionSourceMap: process.env.NODE_ENV === 'production' ? false : true,
  devServer: {
    port: 80,
    disableHostCheck: true,
    proxy: {
      '/': {
        target: 'https://www.geinigejuzichi.top/api_server/'
      }
    }
  },
  configureWebpack: config => {
    /**
     * key: src代码中引入的包名  import Vue from 'key'
     * value: 是js文件中导出的变量名
     * 配置了这一项之后 就不需要再 install 对应的库了， 只需要引入在这里设置的别名 也就是 key 值就可以了
     */
    config.externals = {}
    // if (process.env.NODE_ENV === 'production') {
    //   return {
    //     plugins: [
    //       new CompressionPlugin({
    //         test: /\.js$|\.html$|.\css/, //匹配文件名
    //         threshold: 10240, //对超过10k的数据压缩
    //         deleteOriginalAssets: false //不删除源文件
    //       })
    //     ]
    //   }
    // }
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/main/' : process.env.NODE_ENV === 'alpha' ? '/' : '/',
  assetsDir: assetsDir,
  outputDir: process.env.NODE_ENV === 'production' ? 'dist' : process.env.NODE_ENV === 'alpha' ? 'test' : 'dist',
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, './src/assets/css/var.less')]
    }
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('postcss-pxtorem')({
            rootValue: 37.5, // 换算的基数
            // selectorBlackList: ['van-'], // 忽略转换正则匹配项
            propList: ['*']
          })
        ]
      }
    }
  }
}
