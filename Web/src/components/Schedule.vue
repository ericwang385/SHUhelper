<template lang="pug">
 div( style="padding-botom:51px;")
    //- pull-to(:top-load-method="refresher")
    q-pull-to-refresh(:handler='refresher')
      .schedule-container
        time-table(:task-detail="tasks" @showDetail="showDetail")
    //- q-fixed-position(corner="bottom-right" :offset="[18, 18]")
      q-btn(round @click="capture")
        q-icon(name="mail")
</template>

<script>
import { Toast } from 'quasar'
import PullTo from 'vue-pull-to'
import LeftPanel from '@/LayoutLeftPanel'
import TimeTable from '@/ScheduleTimeTable'
import { randomColor, decrypt } from '@/../libs/utils.js'
// import { Popup, Cell } from 'mint-ui'
// import {convertTimeString} from '@/utils'
// import { calendar, calendarRange, calendarEvents } from '@/vue-calendar-picker'
const CNNUM = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5
}
export default {
  components: {
    LeftPanel,
    PullTo,
    TimeTable
    // Popup,
    // Cell
  },
  data() {
    return {
      popupVisible: false,
      popupContent: '',
      // items: ['课表'],
      e1: '',
      status: {
        lastModified: null,
        status: 'loading',
        remark: '17学年秋季学期课程，信息来自教务网，如果你还没有选课，会看到错误'
      },
      fab: false,
      events: {},
      calendarSelection: {
        start: new Date(2000, 4, 2),
        end: new Date(2000, 4, 7, 12)
      },
      enableCategory: {
        school_calendar: true,
        course: false,
        vacation: false
      },
      range: {
        start: null,
        end: null
      },
      enableSchoolCalendar: {
        year: true,
        term: true,
        week: true
      },
      courses: [],
      active: null,
      schoolTime: {}
    }
  },
  computed: {
    tasks: function() {
      console.log('courseSelected')
      var selected = [[], [], [], [], []]
      for (var i = this.courses.length - 1; i >= 0; i--) {
        var timelist = this.coursetimeToNum(this.courses[i].time)
        var color = [
          '#2B2E4A',
          '#521262',
          '#903749',
          '#53354A',
          '#40514E',
          '#537780',
          '#3765a4',
          '#76a5a4',
          '#579870',
          '#e391b4',
          '#b8954e'
        ]
        var course = this.courses[i]
        var rancolor = color[~~(Math.random() * color.length)]
        for (var j = timelist.length - 1; j >= 0; j--) {
          var time = timelist[j]
          var item = {
            day: time.day,
            Start: time.Start,
            End: time.End,
            coursename: course.name,
            courseno: course.no,
            teachname: course.teacher,
            teachno: course.teach_no,
            place: time.thisWeek ? course.place : '非本周',
            styleObj: {
              height: (time.End - time.Start + 1) * 7.7 + '%',
              top: (time.Start - 1) * 7.69 + '%',
              backgroundColor: time.thisWeek ? rancolor : '#aaa'
            }
          }
          selected[time.day].push(item)
        }
      }
      return selected
    },
    eventsComputed: function() {
      // console.log('computed events')
      return this.events
    },
    calendarEvents: {
      get: function() {
        // var randomColor = require('randomColor')
        var events = []
        for (let id in this.events) {
          let event = this.events[id]
          let category = event.category
          let start = new Date(event.start * 1000)
          let end = new Date(event.end * 1000)
          // console.log(start, end)
          if (this.enableCategory[category]) {
            var endbeforeRange = end.valueOf() <= this.range.start.valueOf()
            var startAfterRange = start.valueOf() >= this.range.end.valueOf()
            // console.log(startBetweenRange,endBetweenRange)
            if (!(endbeforeRange || startAfterRange)) {
              var color = randomColor()
              if (event.key === 'year') {
                color = '#000'
              } else if (event.key === 'term') {
              }
              events.push({
                color: color,
                start: start,
                end: end,
                title: event.title,
                place: event.place,
                category: event.category
              })
            }
          }
        }
        // console.log(events, 'computed')
        return events
      },
      set: function(range) {
        this.range.start = range.start
        this.range.end = range.end
        // console.log('setter')
      }
    }
  },
  created() {
    // this.refreshToolbar()
    this.resetRange()
    this.getCourses()
    this.getEvents(
      this.range.start.valueOf() / 1000,
      this.range.end.valueOf() / 1000
    )
  },
  beforeDestroy() {
    this.$store.commit('clearToolbar')
  },
  methods: {
    capture() {},
    refreshToolbar() {
      // console.log(this.$store.state.toolbar.states[0])
      let createItems = () => {
        let items = []
        for (let i = 1; i <= 10; i++) {
          // console.log('this week', i, this.$store.state.toolbar.states[0], i === this.$store.state.toolbar.states[0])
          items.push({
            name:
              i === this.$store.state.toolbar.states[0]
                ? `第${i}周(当前)`
                : `第${i}周`,
            click: () => {
              // let index = this.$store.state.toolbar.states[0]
              this.$store.commit('updateToolbarState', { index: 0, value: i })
              this.refreshToolbar()
            }
          })
        }
        return items
      }
      let items = createItems()
      let i = this.$store.state.toolbar.states[0]
      this.$store.commit('clearToolbar')
      this.$store.commit('updateToolBar', {
        actions: [
          {
            icon: 'iconfont-calendar',
            items: items
          }
        ],
        states: [i]
      })
    },
    showDetail(obj) {
      for (let i in this.courses) {
        if (this.courses[i].no === obj.courseno) {
          this.popupContent = this.courses[i]
        }
      }
      this.popupVisible = true
    },
    getID() {
      this.$http
        .get('/api/courses/', {
          params: {
            id: true,
            no: this.popupContent.no,
            teacher: this.popupContent.teacher
          }
        })
        .then(response => {
          this.$router.push(`/courses/${response.data.id}`)
        })
    },
    isCourseInWeek(time, week) {
      let inWeek = false
      if (time[4]) {
        if (time[4] === '单') {
          if (week % 2 === 1) {
            inWeek = true
          }
        } else if (time[4] === '双') {
          if (week % 2 === 0) {
            inWeek = true
          }
        }
      } else if (time[5]) {
        if (parseInt(time[5]) <= week && week <= parseInt(time[6])) {
          inWeek = true
        }
      } else if (time[7]) {
        if (week === parseInt(time[7]) || week === parseInt(time[8])) {
          inWeek = true
        }
      } else {
        inWeek = true
      }
      return inWeek
    },
    coursetimeToNum(time) {
      var patt = /([\u4e00|\u4e8c|\u4e09|\u56db|\u4e94])([0-9]+)-([0-9]+)\s*(?:([\u5355|\u53cc|])|\((?:([0-9]+)-([0-9]+)\u5468)\)|\((?:([0-9]+),([0-9]+)\u5468)\))*/
      var timelist = []
      var str = time
      let week = this.$store.state.toolbar.states[0]
      console.log('week', week)
      while (patt.test(str)) {
        var coursetime = patt.exec(str)
        // console.log(coursetime)
        str = str.replace(patt, '')
        var item = {
          day: parseInt(CNNUM[coursetime[1]] - 1),
          Start: parseInt(coursetime[2]),
          End: parseInt(coursetime[3]),
          thisWeek: this.isCourseInWeek(coursetime, week)
        }
        timelist.push(item)
      }
      return timelist
    },
    action(ev) {
      if (this.range.start.valueOf() !== ev.range.start.valueOf()) {
        // console.log(this.range.start !== ev.range.start)
        this.range.start = ev.range.start
        this.range.end = ev.range.end
        this.getEvents(
          this.range.start.valueOf() / 1000,
          this.range.end.valueOf() / 1000
        )
        console.log('not equal')
      }
      console.log(this.range)
      console.log(ev)
    },
    async getCourses() {
      // this.$store.commit('showSnackbar', { text: `查询课表中` })
      let getTime = this.$http.get('/api/time/').then(response => {
        this.schoolTime = response.data
        // this.$store.commit('updateToolbarAction', 0, this.schoolTime.week, 'name', `第${this.schoolTime.week}周(当前)`)
      })
      let getCourses = this.$http
        .get('/api/my-course/')
        .then(response => {
          this.status.status = response.data.status
          this.status.time = response.data.last_modified.$date
          this.courses = decrypt(
            response.data.data,
            this.$store.state.user.password
          )
          if (this.status.status === 'failed') {
            this.renewCourse()
          }
        })
        .catch(err => {
          console.log(err)
          if (err.response.status === 404) {
            this.renewCourse()
          } else {
            this.status.status = 'failed'
            Toast.create(`更新失败${err.response.status}`)
          }
        })
      let i = (await getTime) + (await getCourses)
      console.log(i)
      this.$store.commit('updateToolbarState', {
        index: 0,
        value: this.schoolTime.week
      })
      this.refreshToolbar()
    },
    pollingStatus() {
      this.$http.get('/api/my-course/status').then(response => {
        this.status.status = response.data.status
        if (this.status.status === 'success') {
          this.getCourses()
        } else if (this.status.status === 'loading') {
          setTimeout(this.pollingStatus, 500)
        }
      })
    },
    refresher(done) {
      this.status.status = 'loading'
      this.$store.commit('showSnackbar', { text: `更新课表数据中...` })
      this.$http
        .post('/api/my-course/sync', {
          card_id: this.$store.state.user.cardID,
          password: this.$store.state.user.password
        })
        .then(response => {
          done()
          this.pollingStatus()
        })
        .catch(err => {
          this.status.status = 'failed'
          console.log(err)
        })
    },
    resetRange() {
      let now = new Date()
      let start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      let end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      this.range.start = start
      this.range.end = end
    },
    getEvents(start, end) {
      this.$http
        .get('/api/v1/events/', {
          params: {
            start: start,
            end: end
          }
        })
        .then(response => {
          for (var i in response.data) {
            this.$set(this.events, response.data[i].id, response.data[i])
          }
        })
    }
    // ,
    // selectColor(category){
    //   if(category==='year'){
    //     return
    //   } else if (category === 'term')
    // }
  }
}
</script>

<style lang="stylus" scoped>
@media screen and (max-height: 750px) {
  .schedule-container {
    height: 750px;
  }
}

@media screen and (min-height: 750px) {
  .schedule-container {
    height: 100vh;
  }
}
</style>
