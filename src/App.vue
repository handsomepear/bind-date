<template>
  <div id="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive" />
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive" />
  </div>
</template>
<script>
import toolkit from './utils/_toolkit'
export default {
  created() {
    if (toolkit.isIos()) {
      sessionStorage.setItem('originUrl', window.location.href)
    }
  }
}
</script>
