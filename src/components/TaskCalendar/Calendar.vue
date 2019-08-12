<template lang="pug">

#calendar
    .row.menu
        img.fr(@click='nextMonth'  src='../../assets/images/right.svg')
        img.fl(@click='prevMonth'  src='../../assets/images/left.svg')
        .inline
            .yellowtx(v-if='card.guild') {{card.guild}}
            .soft {{ monthName }} - {{year}}
    .calmonth
        .weekday(v-for='day in DAYS_OF_WEEK') {{ day }}
        .placeholder(v-for='placeholder in firstDay')
        day(v-for='day in days', :day="day", :month='month', :year='year'  :inId='inId'  :ev="eventsByDay[day]")
    .buffer
</template>

<script>
import Day from './Day.vue'

function getDMY(ts){
    let d = new Date(ts)
    let day =  d.getDate()
    let month = d.getMonth()
    let year = d.getFullYear()
    return { day, month, year }
}

export default {
  props: ['inId'],
  components: {
    Day
  },
  methods: {
      nextMonth(){
          if (this.month == 11){
            this.year++
            this.month = 0
          }
          else {
            this.month++
          }
      },
      prevMonth(){
          if (this.month == 0){
              this.year--
              this.month = 11
          }
          else {
              this.month--
          }
      },
      nextYear(){
          this.year++
      },
      prevYear(){
          this.year--
      }
  },
  computed: {
    eventsByDay(){
        let evs = {}
        this.todaysEvents.forEach(t => {
            if (t && t.book && t.book.startTs){
                let date = getDMY(t.book.startTs)
                if (date.month === this.month && date.year === this.year){
                    if (!evs[date.day]){
                        evs[date.day] = []
                    }
                    evs[date.day].push(t)
                  }
            }
        })
        return evs
    },
    card(){
        return this.$store.getters.hashMap[this.inId]
    },
    todaysEvents(){
        let allTasks = this.card.subTasks.concat(this.card.priorities).concat(this.card.completed)
        return allTasks.map(tId => {
            return this.$store.getters.hashMap[tId]
        })
    },
    firstDay(){
      let date = new Date(this.year, this.month, 1)
      let firstDay = date.getDay()
      return firstDay
    },
    days(){
      return  new Date(this.year, this.month + 1, 0).getDate()
    },
    monthName(){
        var mL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return mL[this.month]
    }
  },
  data () {
    let current = new Date
    let year = current.getFullYear()
    let month = current.getMonth()
    return {
      DAYS_OF_WEEK:['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      month,
      year
    }
  },
}
</script>

<style lang='stylus' scoped>
@import '../../styles/colours';

.soft
    color: softGrey

.inline
  display:inline-block
  margin:15px

#calendar
    color: main
    font-size:2em

.menu
    text-align: center
    color: darkteal

.calendar-column
    float: left
    box-sizing: border-box
    width: (100/7)%
    height: 100px
    border-style:solid
    border-width: 1px
    border-color: darkteal
.placeholder
    @extends .calendar-column
.day
    @extends .calendar-column
.weekday
    @extends .calendar-column
    height: 40px
    text-align: center
    font-weight:lighter
    font-size: .7em
    border-style:solid
    color:darkteal
.date
    background-color: white
    float: right
    font-weight: bolder
    font-size: .666em

.legend
    margin-top: -70px

td
    border: none

.availablebox, .bookedbox
    height: 20px
    width: 20px

.bookedbox
    background-color: green
.availablebox
    background-color: accent2
.signcell
    max-width: 0px

.downhalfbox
    padding-top: 10px

table
    font-size: .7em

tr, td
    padding:0
    padding-left: 11px
.ch
    color: accent2

.do
    color: green

img
    height: 30px

.calmonth
    margin: 0 2% 2% 2%

.buffer
   clear: both
   height: 0.45em

.fl
    float: left
.fr
    float: right
</style>
