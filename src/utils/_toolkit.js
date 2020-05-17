import request from './_axios.conf'
import _env from './_ENV'
import wx from 'weixin-js-sdk'

const toolkit = {
  data: {
    appId: _env.appId
  },
  getRequest() {
    const url = location.search //获取url中"?"符后的字串
    const theRequest = {}
    if (url.indexOf('?') !== -1) {
      const str = url.substr(1)
      const strs = str.split('&')
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
      }
    }
    return theRequest
  },
  // 获取 code
  login(success, fail) {
    const requestParams = this.getRequest()
    const proxyId = requestParams.proxyId
    // 保存 proxyId ，在分享的时候需要使用
    proxyId && sessionStorage.setItem('proxyId', proxyId)
    let url = window.location.href
    const codeStr = url.match(/[?&]code=\w+&state=\w+/g)
    // 截取一下微信重定向加的参数 避免多次使用当前的 code
    if (codeStr) {
      url = url.replace(codeStr, '')
    }
    // code 已经拿到
    if (requestParams.code) {
      // 记录登录次数 如果超过两次则取消请求表示登录失败 退出重新进入
      let loginCount = sessionStorage.getItem('loginCount') || 0
      sessionStorage.setItem('loginCount', ++loginCount)
      request({
        url: '/login',
        data: { code: requestParams.code, proxyId: parseInt(proxyId) || '' }
      })
        .then(({ data }) => {
          success && success(data)
        })
        .catch(err => {
          window.location.href = url
          fail && fail(err)
        })
    } else {
      // eslint-disable-next-line no-console
      console.log(url)
      window.location.href =
        'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
        this.data.appId +
        '&redirect_uri=' +
        encodeURIComponent(url) +
        '&response_type=code&scope=snsapi_userinfo&state=123&connect_redirect=1#wechat_redirect'
    }
  },
  // 判断地址栏出现微信自己加的参数问题
  isWeChatUrl() {
    // debugger;
    let url = window.location.href
    let matchResult = url.match(/\?/g)
    // 如果地址栏中，出现了两个问号的话，那么是微信在分享添加了参数
    // 如果地址栏中，出现了form=,那么就是微信分享添加的参数
    return (matchResult ? matchResult.length >= 2 : false) || /from=/.test(url)
  },
  // 把地址栏的中微信追加的参数去掉，返回我们自己项目的地址
  getProjectUrl() {
    let location = window.location
    return location.origin + location.pathname + location.hash
  },
  wxConfig() {
    request({
      url: '/jssdk/config',
      data: { url: window.location.href.split('#')[0] }
    }).then(({ data }) => {
      wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: _env.appId, // 必填，公众号的唯一标识
        timestamp: data.data.timestamp, // 必填，生成签名的时间戳
        nonceStr: data.data.nonceStr, // 必填，生成签名的随机串
        signature: data.data.signature, // 必填，签名
        jsApiList: [
          'onMenuShareAppMessage',
          'onMenuShareTimeline',
          'getLocation',
          'chooseWXPay',
          'chooseImage',
          'uploadImage',
          'getLocalImgData'
        ] // 必填，需要使用的JS接口列表
      })
    })
  },
  wxShare(target, params) {
    // 解决微信二次分享的问题
    wx.ready(() => {
      wx[target](params)
    })
  },
  wxPay(params) {
    wx.chooseWXPay(params)
  }
  // 根据百度地图获取定位城市
  // getLocationFromBidu(positionCb) {
  // wx.ready(() => {
  //   wx.getLocation({
  //     type: 'wgs84',
  //     success: res => {
  //       const point = new window.BMap.Point(res.longitude, res.latitude)
  //       const gc = new window.BMap.Geocoder()
  //       gc.getLocation(point, positionCb)
  //     }
  //   })
  // })
  // }
}

export default toolkit
