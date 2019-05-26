<template lang="pug">

#calendar
    div(@click='prevMonth')
        p prev
    div(@click='nextMonth')
        p next
    slot
    .weekday(v-for='dayName in DAYS_OF_WEEK') {{dayName}}
    .placeholder(v-for='placeholder in firstDay')
    //- day( :day="day", :month='month', :year='year')
    day( day="1", month='6', year='2017')

</template>

<script>
import Day from './Day.vue'

export default {
  components: {
    Day
  },
  computed: {
    firstDay: function(){
      let date = new Date(this.year, this.month-1, 1)
      let firstDay = date.getDay()
      console.log({date, firstDay})
      return firstDay
    }
  },
  methods: {
      nextMonth(){
          this.month++
      },
      prevMonth(){
          this.month--
      }
  },
  data () {
    let current = new Date
    let year = current.getFullYear()
    let month = current.getMonth() + 1
    return {
      DAYS_OF_WEEK:['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      days: new Date(year, month, 0).getDate(),
      month,
      year
    }
  },
}
</script>

<style lang='stylus' scoped>
@import '../../../styles/colours'
#calendar
    color: accent1
    font-size:2em
.calendar-column
    float: left
    box-sizing: border-box
    width: (96/7)%
    height: 100px
    border-style:solid
    border-width: 1px
.placeholder
    @extends .calendar-column
.day
    @extends .calendar-column
.weekday
    @extends .calendar-column
    height: 40px
    text-align: center
    font-weight:bolder
    border-style:solid
.date
    background-color: white
    float: right
    font-weight: bolder
    font-size: .666em
</style>
