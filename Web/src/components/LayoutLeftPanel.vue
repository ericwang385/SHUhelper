<template lang="pug">
  q-list.no-padding(no-border='')
    q-card.full-width.no-margin.left-banner(flat='')
      q-card-main
        q-side-link(item='', :to="$store.state.user.cardID===''?'/login':`/profile/${$store.state.user.cardID}`")
          q-item-side(:avatar='`//static.shuhelper.cn/${$store.state.user.avatar}`')
          q-item-main
            q-item-tile(label='') {{$store.state.user.name}}
            q-item-tile(sublabel='') {{$store.state.user.cardID}}
          q-item-side
            q-btn(flat='', v-if="$store.state.user.cardID!==''", @click.stop='logout') 注销
            q-btn(flat='', v-else='', @click.stop="$router.push('/login')") 登陆
    // <q-list-header>Essential Links</q-list-header>
    div(v-if="$q.platform.is.ios")
      q-side-link(v-for="link in internalNavigationiOS" :key="link.name" item='', sparse='', :to='link.to')
        q-item-side(:icon='link.icon')
        q-item-main(:label='link.name')
    div(v-else)
      q-side-link(v-for="link in internalNavigationAndroid" :key="link.name" item='', sparse='', :to='link.to')
        q-item-side(:icon='link.icon')
        q-item-main(:label='link.name')
</template>

<script>
import { Toast } from 'quasar'
export default {
  name: 'leftPanel',
  data() {
    return {
      internalNavigationAndroid: [
        { to: '/index', icon: 'fa-xuexiao', name: '首页' },
        // { to: '/square', icon: 'fa-xuexiao', name: '广场' },
        // { to: '/apps', icon: 'fa-xuexiao', name: '应用' },
        { to: '/schedule', icon: 'fa-calendar1', name: '日程' }
        // { to: '/message', icon: 'fa-xuexiao', name: '消息' },
        // { to: '/config', icon: 'fa-xuexiao', name: '设置  ' }
      ],
      internalNavigationiOS: [
        { to: '/index', icon: 'fa-xuexiao', name: '首页' },
        { to: '/schedule', icon: 'fa-calendar1', name: '日程' }
        // { to: '/config', icon: 'fa-xuexiao', name: '设置  ' }
      ]
    }
  },
  methods: {
    logout() {
      localStorage.clear()
      sessionStorage.clear()
      let token = this.$store.state.user.token
      this.$store.commit('clearAccount')
      this.$router.push('/login')
      Toast.create({ html: '已注销' })
      this.$http.get('/api/users/logout?token=' + token)
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
