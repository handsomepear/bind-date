<template>
  <div class="home-page">
    <section class="main">
      <!-- 列表 -->
      <van-list
        v-show="tabSex === 2"
        v-model="female.loading"
        :finished="female.finished"
        finished-text="没有更多了"
        :immediate-check="false"
        @load="getPostList"
      >
        <!-- 相亲贴Item -->
        <section class="person-item van-hairline--bottom" v-for="item in female.postList" :key="item.id">
          <!-- 个人信息 -->
          <div class="info">
            <div>
              <span class="title">{{ item.name }}</span>
              <span>年龄:{{ item.age }}岁 <span class="vertical-line">|</span> 家乡:{{ item.city }}</span>
            </div>
            <div>
              <span>
                职业:{{ item.occupation }} <span class="vertical-line">|</span> 工作地点:{{ item.workCity }}
                <span class="vertical-line">|</span> 学历:
                {{ item.educational }}
              </span>
            </div>
          </div>
          <!-- 择偶标准 -->
          <div class="standard">
            <div class="text">
              <span class="title">择偶标准:</span>
              {{ item.standard }}
              <span class="more" @click="onViewDetail(item.id)"> 详情>></span>
            </div>
          </div>
          <!-- 照片 -->
          <div class="photos">
            <div class="photo-box" v-for="(photoItem, photoIndex) in item.imgs.slice(0, 6)" :key="photoIndex">
              <img :src="photoItem + '?imageslim'" alt="" />
            </div>
            <div class="photo-box last van-photo-last"></div>
          </div>
          <!-- bottom -->
          <div class="item-bottom flex-box flex-between-center">
            <div class="release-time">发布时间：{{ item.publishTime }}</div>
            <div class="contact-way" @click="onViewDetail(item.id)">查看联系方式>></div>
          </div>
        </section>
      </van-list>
      <van-list
        v-show="tabSex === 1"
        v-model="male.loading"
        :finished="male.finished"
        finished-text="没有更多了"
        :immediate-check="false"
        @load="getPostList"
      >
        <!-- 相亲贴Item -->
        <section class="person-item van-hairline--bottom" v-for="item in male.postList" :key="item.id">
          <!-- 个人信息 -->
          <div class="info">
            <div>
              <span class="title">{{ item.name }}</span>
              <span>年龄:{{ item.age }}岁 <span class="vertical-line">|</span> 家乡:{{ item.city }}</span>
            </div>
            <div>
              <span>
                职业:{{ item.occupation }} <span class="vertical-line">|</span> 工作地点:{{ item.workCity }}
                <span class="vertical-line">|</span> 学历:
                {{ item.educational }}
              </span>
            </div>
          </div>
          <!-- 择偶标准 -->
          <div class="standard">
            <div class="text">
              <span class="title">择偶标准:</span>
              {{ item.standard }}
              <span class="more" @click="onViewDetail(item.id)"> 详情>></span>
            </div>
          </div>
          <!-- 照片 -->
          <div class="photos">
            <div class="photo-box" v-for="(photoItem, photoIndex) in item.imgs.slice(0, 6)" :key="photoIndex">
              <img :src="photoItem + '?imageslim'" alt="" />
            </div>
            <!-- 占位：避免 space-between 导致图片不连续排列 -->
            <div class="photo-box last van-photo-last"></div>
          </div>
          <!-- bottom -->
          <div class="item-bottom flex-box flex-between-center">
            <div class="release-time">发布时间：{{ item.publishTime }}</div>
            <div class="contact-way" @click="onViewDetail(item.id)">查看联系方式>></div>
          </div>
        </section>
      </van-list>
    </section>
    <!-- head 放到这里解决 share 组件内部 z-index 设置之后无法覆盖掉头部的问题 -->
    <!-- 这是由于head 设置了 z-index 为 1 高于了 Share 组件, 那么在 Share 组件内部的 wrap 也就无法盖住 head 了 -->
    <section class="head">
      <div class="top">
        <div class="area-type" @click="isShowType = true">{{ type.name }} <van-icon name="arrow-down" /></div>
        <div class="area-type" @click="isShowAreaPanel = true">{{ location.city }}<van-icon name="arrow-down" /></div>
      </div>
      <section class="tab-list">
        <div :class="['tab-item flex-box flex-center', tabSex === 2 ? 'choosed' : '']" @click="onChooseTab(2)">
          女生
        </div>
        <div :class="['tab-item flex-box flex-center', tabSex === 1 ? 'choosed' : '']" @click="onChooseTab(1)">
          男生
        </div>
      </section>
    </section>
    <section class="bottom-options flex-box flex-between-center">
      <!-- 创建相亲贴 -->
      <div class="create-button flex-box flex-center" @click="toCreatePage">
        <van-icon name="add-o" size="20" />创建相亲贴
      </div>
      <!-- 我的 -->
      <div class="mine-button flex-box flex-center" @click="toMinPage">我的</div>
      <!-- 分享 -->
      <Share size="small" />
    </section>
    <van-action-sheet
      v-model="isShowType"
      :actions="typeOptions"
      @select="onSelectType"
      cancel-text="取消"
      @cancel="isShowType = false"
    />
    <van-popup v-model="isShowAreaPanel" position="bottom">
      <van-area
        :area-list="areaList"
        :title="type.name + '选择'"
        :value="locationCode"
        columns-num="2"
        @confirm="onChooseArea"
        @cancel="isShowAreaPanel = false"
      />
    </van-popup>
  </div>
</template>

<script>
import { onMounted, reactive, toRefs, watch } from '@vue/composition-api'
import areaList from '@/static/data/location.js'
import Share from '@/components/Share.vue'
import { getPostListApi } from '../../api/api'
import toolkit from '../../utils/_toolkit'
export default {
  components: {
    Share
  },
  setup(props, context) {
    const router = context.root.$router
    const data = reactive({
      // 地域类型
      type: {
        name: '家乡',
        value: 1
      },
      location: {
        name: '',
        province: '全部',
        city: '全部'
      },
      isShowType: false,
      isShowAreaPanel: false,
      userSex: 0, // 0 未知 1 男 2 女
      tabSex: 2, // 1：男 2：女
      male: {
        loading: false,
        finished: false,
        nextPage: '',
        postList: []
      },
      female: {
        loading: false,
        finished: false,
        nextPage: '',
        postList: []
      },
      areaList: null,
      // 列表相关

      // 地域类型配置
      typeOptions: [
        {
          name: '家乡',
          value: 1
        },
        {
          name: '工作地点',
          value: 2
        }
      ],
      locationCode: ''
    })

    const getPostList = () => {
      const sex = data.tabSex === 2 ? 'female' : 'male'
      data[sex].loading = true
      const province = data.location.province
      const city = data.location.city
      getPostListApi({
        pageSize: 5,
        // pageRecord: data.tabSex === 2 ? data.female.nextPage : data.male.nextPage,
        pageRecord: data[sex].nextPage,
        province: province === '全部' ? '' : province,
        city: city === '全部' ? '' : city,
        sex: data.tabSex,
        locType: data.type.value
      })
        .then(({ data: resData }) => {
          data[sex].postList = data[sex].postList.concat(resData.list)
          data[sex].nextPage = resData.nextPageRecord // 获取下一页的数据的参数
          data[sex].loading = false
          if (!resData.list || resData.list.length < 5) {
            data[sex].finished = true // 控制列表是否加载完毕
          }
          // 女生列表有数据就选女生 否则选男生
          const shareItem = data['female'].postList[0] || data['male'].postList[0]
          const userInfo = JSON.parse(localStorage.getItem('userInfo'))
          const proxyId = userInfo.proxyId
          toolkit.wxShare('onMenuShareTimeline', {
            title: '找一个生活习惯相同的人结婚-本地人相亲', // 分享标题
            link: location.protocol + '//www.geinigejuzichi.top/' + (proxyId ? '?proxyId=' + proxyId : ''), // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: shareItem && shareItem.imgs[0] // 分享图标
          })
          toolkit.wxShare('onMenuShareAppMessage', {
            title: '找一个生活习惯相同的人结婚-本地人相亲', // 分享标题
            desc:
              shareItem &&
              `年龄:${shareItem.age}, 家乡:${shareItem.city}, 职业:${shareItem.occupation}, 工作地点:${shareItem.workCity}, 择偶标准:${shareItem.standard}`, // 分享描述
            link: location.protocol + '//www.geinigejuzichi.top/' + (proxyId ? '?proxyId=' + proxyId : ''), // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: shareItem && shareItem.imgs[0]
          })
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log(err)
        })
    }
    watch(
      [() => data.type.value, () => data.location.name],
      () => {
        const sex = data.tabSex === 2 ? 'female' : 'male'
        data[sex].nextPage = ''
        data[sex].postList = []
        getPostList()
      },
      { lazy: true }
    )

    // const locationSlice = name => {
    //   if (name.indexOf('市') > -1 || name.indexOf('省') > -1) {
    //     return name.slice(0, name.length - 1)
    //   }
    //   return name
    // }

    // const getLocationAndList = () => {
    //   const location = localStorage.getItem('location')
    //   if (location) {
    //     return (data.location = location)
    //   }
    //   toolkit.getLocationFromBidu(position => {
    //     const address = position.addressComponents
    //     const province = locationSlice(address.province)
    //     const city = locationSlice(address.city)
    //     // streetNumber: "3号"
    //     // street: "中关村北一条"
    //     // district: "海淀区"
    //     // city: "北京市"
    //     // province: "北京市"
    //     data.location = {
    //       name: `${province}-${city}`,
    //       province: province || '北京',
    //       city: city || '北京'
    //     }
    //   })
    // }

    onMounted(() => {
      toolkit.wxConfig()
      data.areaList = areaList
      const userInfo = window.userInfo || JSON.parse(localStorage.getItem('userInfo'))
      if (userInfo) {
        const userSex = userInfo.sex
        if (userSex === 1) data.tabSex = 2
        if (userSex === 2) data.tabSex = 1
        if (userSex === 0) data.tabSex = 1
        // getLocationAndList()
        getPostList()
      } else {
        toolkit.login(resData => {
          window._TOKEN = resData.token
          localStorage.setItem('token', resData.token)
          localStorage.setItem('userInfo', JSON.stringify(resData.user))
          const userSex = resData.user.sex
          if (userSex === 1) data.tabSex = 2
          if (userSex === 2) data.tabSex = 1
          if (userSex === 0) data.tabSex = 1
          // getLocationAndList()
          getPostList()
        })
      }
    })

    const filterLocation = location => {
      const locationList = ['北京-北京', '天津-天津', '上海-上海', '重庆-重庆']
      const index = locationList.indexOf(location)
      return index > -1 ? locationList[index].split('-')[0] : location
    }

    // 类型选择
    const onSelectType = item => {
      data.type = item
      data.isShowType = false
    }

    // 地区选择
    const onChooseArea = area => {
      data.locationCode = area[1] ? area[1].code : area[0].code
      data.location = {
        name: area.reduce((prev, next) => {
          const province = prev.name
          const city = next.name
          return next ? province + '-' + city : province + '-' + province
        }),
        province: area[0].name,
        city: area[1].name
      }
      data.isShowAreaPanel = false
    }
    // Tab选择
    const onChooseTab = sex => {
      data.tabSex = sex
      if ((sex === 2 && !data.female.postList.length) || (sex === 1 && !data.male.postList.length)) {
        getPostList()
      }
    }
    const onViewDetail = postId => {
      router.push({ path: '/detail/' + postId })
    }
    const toCreatePage = () => {
      router.push({ path: '/create' })
    }
    const toMinPage = () => {
      router.push({ path: '/mine' })
    }
    const onShare = () => {
      data.isShowShareTips = true
    }
    return {
      ...toRefs(data),
      // 事件
      onSelectType,
      onChooseArea,
      onChooseTab,
      getPostList,
      onViewDetail,
      toCreatePage,
      toMinPage,
      onShare,
      filterLocation
    }
  }
}
</script>

<style lang="less" src="./home.less" scoped></style>
