<template lang="pug">
.day(@click='selectDay', v-bind:class='status')
  .date {{ day }}

</template>

<script>
import _ from 'lodash'

function getDMY(ts){
    let d = new Date(ts)
    let day =  d.getDate()
    let month = d.getMonth()
    let year = d.getFullYear()
    return { day, month, year}
}

export default {
  components: {},
  props: ['day', 'month', 'year'],
  computed: {
      // use getDMY , match bookings
      todaysBookings(){
          return []
      },
  },
  computed: {
      status(){
          let tsNow = Date.now()
          let today = new Date(
              this.year,
              this.month,
              this.day
          )
          let tsDay = today.getTime()

          if (tsDay < tsNow){
              return {
                  past: true
              }
          }
          return {
              available: true
          }
      }
  },
  methods: {
      selectDay(){
          // todo - call action
      }
  }
}
</script>

<style lang='stylus' scoped>

@import '../../../styles/colours'

label
    padding: 0
    margin: 0

.day
    position: relative
    background-color: main
    overflow: visible

.date
    text-align:right
    height: 30px
    margin-top: 0
    margin-bottom:-30px
    font-weight: bolder
    font-size: .9em
    padding: 5px 5px 5px 5px

.past
    background-color: main

.available
    height: 100px
    background-color: accent3

.available:hover
    background-color: accent2

.selected
    background-color: red


</style>
