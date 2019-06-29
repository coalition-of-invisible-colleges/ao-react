<template lang="pug">
.day
  .date {{ day }}
  img.upgrade(v-for='t in ev' src='../../assets/images/timecubewithwhite.png')
</template>

<script>
import _ from 'lodash'

function getDMY(ts){
    let d = new Date(ts)
    let day =  d.getDate()
    let month = d.getMonth()
    let year = d.getFullYear()
    return { day, month, year }
}

export default {
  components: {},
  props: ['day', 'month', 'year', 'inId', 'ev'],
  computed: {
      calcDayRange(){

          return
      },

  },
}
</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

label
    padding: 0
    margin: 0
    color: black

.upgrade
    width: 80%

.type
    font-size: .5em
    float: left
    white-space: nowrap;
    // font-size

.day
    position: relative
    background-color: softGrey
    overflow: visible

.date
    text-align:right
    height: 1.7em
    margin-top: 0
    margin-bottom:-30px
    font-weight: bolder
    font-size: .9em
    padding: 5px 5px 5px 5px

.amount
    font-size: .49em
    position: absolute;
    bottom: 0;
    left: 0;

.inc
    color: accent2

.dec
    color: red

.b
		text-align: center
		border-radius: 8%
		color: main
		font-size: .8em

.p
		background-color: green
		border-right-style: solid
		border-color: green
.c
		background-color: green

</style>
