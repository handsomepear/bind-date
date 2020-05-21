<template>
  <div class="detail-page" v-if="postDetail">
    <Title :name="postDetail.name + '的相亲详情'" color="#000" />
    <!-- 照片 -->
    <van-swipe class="photos" @change="onPhotoChange">
      <van-swipe-item v-for="(item, index) in postDetail.imgs" :key="index">
        <img :src="item + '?imageslim'" alt="" />
      </van-swipe-item>
      <div class="custom-indicator" slot="indicator">{{ current + 1 }}/{{ postDetail.imgs.length }}</div>
    </van-swipe>
    <!-- 相亲贴Item -->
    <section class="person-item">
      <!-- 个人信息 -->
      <div class="info">
        <div>
          <span class="title">{{ postDetail.name }}</span>
          <span>年龄:{{ postDetail.age }}岁 <span class="vertical-line">|</span> 家乡:{{ postDetail.city }}</span>
        </div>
        <div>
          <span>
            职业:{{ postDetail.occupation }} <span class="vertical-line">|</span> 工作地点:{{ postDetail.workCity }}
            <span class="vertical-line">|</span> 学历:{{ postDetail.educational }}
          </span>
        </div>
      </div>
      <!-- 择偶标准 -->
      <div class="standard">
        <div class="text">
          <span class="title">择偶标准:</span>
          {{ postDetail.standard }}
        </div>
      </div>
    </section>
    <div v-if="postDetail.hasBuy" class="complain-btn flex-column flex-center" @click="isShowComplainModal = true">
      <img src="../../assets/imgs/tousu.png" alt="" />
      <span>投诉</span>
    </div>
    <div class="home-btn flex-column flex-center" @click="onGoHome">
      <img src="../../assets/imgs/home.png" alt="" />
      <span>首页</span>
    </div>
    <section class="page-bottom can-edite" v-if="canEdite">
      <!-- 可编辑 -->
      <div class="option flex-between-center">
        <div class="edite-btn flex-center" @click="onEdite">编辑</div>
        <div class="delete-btn flex-center" @click="onDelete">删除</div>
        <Share size="medium" />
      </div>
    </section>
    <!-- 底部 -->
    <section class="page-bottom" v-else>
      <!-- 不可编辑 -->
      <div class="contact-way flex-between-center" v-if="postDetail.hasBuy">
        <div
          v-if="postDetail.vx"
          class="contact-button flex-center"
          v-clipboard:copy="postDetail.vx"
          v-clipboard:success="mineCopySuccess"
        >
          <span>微信：</span>
          <span>{{ postDetail.vx }}</span>
        </div>
        <Share />
      </div>
      <div class="contact-way flex-between-center" v-else>
        <div class="contact-button flex-center" @click="onShowPayModal">获取联系方式</div>
        <Share />
      </div>
      <div class="option flex-between-center">
        <!-- 公众号 -->
        <div class="public-code flex-center" @click="goPublicPage">
          <img src="../../assets/imgs/hongbao.png" alt="" />
          <span>关注公众号，方便下次进入</span>
        </div>
      </div>
    </section>
    <!-- 支付弹窗 -->
    <van-overlay :show="isShowPayModal">
      <div class="pay-wrap flex-start-center flex-column" @click="isShowPayModal = false">
        <div class="pay-modal" @click.stop>
          <div class="content">联系方式需10元购买</div>
          <div class="price">¥10</div>
          <div class="pay-btn flex-center" @click="onPay">立即支付</div>
          <div class="tips">注：比起给媒婆发的红包，划算多了。</div>
          <div class="close-btn" @click="isShowPayModal = false">
            <van-icon name="cross" color="#C0C0C0" />
          </div>
        </div>
      </div>
    </van-overlay>
    <!-- 投诉弹窗 -->
    <section v-if="isShowComplainModal">
      <van-overlay :show="isShowComplainModal">
        <div class="complain-wrap flex-center" @click="isShowComplainModal = false">
          <div class="complain-modal" @click.stop>
            <div class="title">投诉</div>
            <div class="complain-form">
              <h2>投诉原因</h2>
              <!-- <van-field type="textarea" placeholder="请输入..." class="reason" /> -->
              <div class="text-con">
                <textarea placeholder="请输入..." v-model="accuseReason"></textarea>
              </div>
              <h2>电话号码</h2>
              <div class="tel-con">
                <input type="text" v-model="accuseTel" />
              </div>
              <div class="tips">注：请保持电话畅通，工作人员会尽快联系您。</div>
              <div class="submit-btn flex-center" @click="onSubmitAccuse">提交</div>
            </div>
            <div class="close-btn" @click="isShowComplainModal = false">
              <van-icon name="cross" color="#C0C0C0" />
            </div>
          </div>
        </div>
      </van-overlay>
    </section>
  </div>
</template>

<script>
import { ref, reactive, toRefs, onMounted } from '@vue/composition-api'
import Title from '@/components/Title.vue'
import Share from '@/components/Share.vue'
import { getPostDetailApi, deleteApi, accuseApi, buyApi } from '../../api/api'
import toolkit from '../../utils/_toolkit'
export default {
  components: {
    Share,
    Title
  },
  setup(props, context) {
    const router = context.root.$router // 路由实例
    const route = context.root.$route // 拿参数信息
    const Toast = context.root.$toast
    const Dialog = context.root.$dialog
    const data = reactive({
      current: 0,
      isShowPayModal: false, // 是否展示支付弹窗
      isShowComplainModal: false, // 是否展示投诉弹窗
      parentWx: '',
      canEdite: false,
      postDetail: null,
      accuseReason: '', // 投诉原因
      accuseTel: '' // 投诉电话
    })
    const shareButtonStyle = ref({
      width: '167.5px',
      height: '44px',
      background: '@themeColor',
      boxShadow: '0px 3px 6.5px 0px rgba(37, 211, 207, 0.4)',
      borderRadius: '8px',
      color: '#fff'
    })
    // 获取帖子详情
    const getPostDetail = () => {
      getPostDetailApi({
        id: route.params.postId
      }).then(({ data: resData }) => {
        data.postDetail = resData.post
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const userId = userInfo.id
        const proxyId = userInfo.proxyId
        if (data.postDetail.userId && userId === data.postDetail.userId) {
          data.canEdite = true
        }
        const shareLink =
          location.protocol +
          '//www.geinigejuzichi.top/main/detail/' +
          route.params.postId +
          (proxyId ? '?proxyId=' + proxyId : '')
        toolkit.wxShare('onMenuShareTimeline', {
          title: '找一个生活习惯相同的人结婚-本地人相亲', // 分享标题
          link: shareLink, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: data.postDetail.imgs[0] // 分享图标
        })
        toolkit.wxShare('onMenuShareAppMessage', {
          title: '找一个生活习惯相同的人结婚-本地人相亲', // 分享标题
          desc: `年龄:${data.postDetail.age}, 家乡:${data.postDetail.city}, 职业:${data.postDetail.occupation}, 工作地点:${data.postDetail.workCity}, 择偶标准:${data.postDetail.standard}`, // 分享描述
          link: shareLink, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: data.postDetail.imgs[0]
        })
      })
    }

    onMounted(() => {
      toolkit.wxConfig()
      getPostDetail()
    })

    const onPhotoChange = index => {
      data.current = index
    }
    const onGoHome = () => {
      router.replace({ path: '/' })
    }

    const onShowPayModal = () => {
      if (!data.postDetail.hasBuy) {
        data.isShowPayModal = true
      }
    }
    const onPay = () => {
      // 支付
      buyApi({
        postId: route.params.postId
      }).then(({ data: resData }) => {
        toolkit.wxPay({
          timestamp: resData.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
          nonceStr: resData.nonceStr, // 支付签名随机串，不长于 32 位
          package: 'prepay_id=' + resData.prepayId, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
          signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
          paySign: resData.paySign, // 支付签名
          success: function() {
            data.isShowPayModal = false
            // 显示微信号
            data.postDetail.hasBuy = true
          }
        })
      })
    }

    const mineCopySuccess = () => {
      Toast('本人微信复制成功')
    }

    // 编辑帖子
    const onEdite = () => {
      const formData = JSON.stringify(data)
      router.push({ name: 'Create', params: { formData } })
    }

    // 删除帖子
    const onDelete = () => {
      Dialog.confirm({
        message: '确定要删除该相亲帖吗？',
        cancel: () => {}
      })
        .then(() => {
          deleteApi({
            postId: route.params.postId
          }).then(() => {
            router.replace({ path: '/mine' })
          })
        })
        .catch(() => {
          // console.log('取消')
        })
    }

    // 投诉
    const onSubmitAccuse = () => {
      if (!data.accuseReason) {
        return Toast('请输入投诉原因')
      }
      if (!data.accuseTel) {
        return Toast('请输入手机号')
      }

      if (!/^1\d{10}$/.test(data.accuseTel.replace(/\s/g, ''))) {
        return Toast('请输入正确格式的手机号')
      }
      accuseApi({
        postId: Number(route.params.postId),
        reason: data.accuseReason,
        tel: data.accuseTel
      }).then(() => {
        data.isShowComplainModal = false
        Toast('投诉成功')
      })
    }

    const goPublicPage = () => {
      router.push({ name: 'PublicCode' })
    }

    return {
      ...toRefs(data),
      shareButtonStyle,
      onPhotoChange,
      onGoHome,
      onShowPayModal,
      onPay,
      mineCopySuccess,
      onDelete,
      onEdite,
      onSubmitAccuse,
      goPublicPage
    }
  }
}
</script>

<style lang="less" src="./Detail.less" scoped></style>
