// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
// require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================

// Uncomment the following lines if you need IE11/Edge support
// require(`quasar/dist/quasar.ie`)
// require(`quasar/dist/quasar.ie.${__THEME}.css`)

import Vue from 'vue'
// import Quasar from 'quasar'
import router from './router'
import Quasar, * as All from 'quasar'
import Vuex from 'vuex'
import axios from 'axios'
import state from './states'
import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)
import VueAMap from 'vue-amap'
Vue.use(VueAMap)
VueAMap.initAMapApiLoader({
  key: 'ad8f18c4339cb057e3290e15c0bf3ce7',
  plugin: ['AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType'],
  uiVersion: '1.0'
})
Vue.prototype.$map = VueAMap
import ga from 'libs/analytics.js'
router.afterEach((to, from) => {
  ga.logPage(to.path, to.name, 'UA-111372547-1')
})
axios.interceptors.response.use(
  function(response) {
    // Do something with response data
    // console.log(response)
    return response
  },
  function(error) {
    // console.log('err from interceptor', error)
    if (error.response.status === 401) {
      // console.log('401 err', store)
      // store.commit('showSnackbar', {
      //   text: `需要先登录`
      // })
      // console.log(router.history)
      if (router.history.current.fullPath !== '/login') {
        router.push('/login?redirect=' + router.history.current.fullPath)
      }
      // store.commit('showLoginDialog')
    }
    return Promise.reject(error)
  }
)
Vue.filter('two_digits', value => {
  if (value < 0) {
    return '00'
  }
  if (value.toString().length <= 1) {
    return `0${value}`
  }
  return value
})
Vue.prototype.$http = axios
// ...
Vue.use(Quasar, {
  components: All,
  directives: All
})
Vue.use(Vuex)
const store = new Vuex.Store(state)
Vue.config.productionTip = false
// Vue.use(Quasar) // Install Quasar Framework
Vue.prototype.$UHE = {
  version: 0.1,
  appName: 'SHUhelper',
  schoolName: '上海大学'
}
if (__THEME === 'mat') {
  require('quasar-extras/roboto-font')
}
import 'quasar-extras/material-icons'
// import 'quasar-extras/ionicons'
// import 'quasar-extras/fontawesome'
// import 'quasar-extras/animate'
Vue.filter('cnNum', function(value) {
  value = value.toString()
  let map = {
    '1': '一',
    '2': '二',
    '3': '三',
    '4': '四',
    '5': '五',
    '6': '六',
    '7': '七',
    '8': '八',
    '9': '九'
  }
  return map[value]
})
Vue.filter('term', function(value) {
  let map = {
    '1': '秋',
    '2': '冬',
    '3': '春',
    '4': '夏'
  }
  let year = parseInt(value.slice(2, 4))
  return `${year}-${year + 1}${map[value[5]]}`
})
Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    router,
    store,
    render: h => h(require('./App').default)
  })
})
