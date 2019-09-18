<template lang="pug">
.day
  .date {{ day }}
  .amount.inc(v-if='balChange > 0') {{ balChange }}
  .amount.dec(v-if='balChange < 0') {{ balChange }}
  template(v-for='t in evTypes')
    label.type {{ t }}

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
      todaysEvents(){
          let t = []
          return t
      },
      balChange(){
          let amount = 0
          this.todaysEvents.forEach( ev => {
              if (ev.paid) amount += parseFloat( ev.paid )
              if (ev.charged) amount -= parseFloat( ev.charged )
          })
          return amount.toFixed(2)
      },
      evTypes(){
          let evTypes = []
          this.todaysEvents.forEach( ev => {
              evTypes.push(ev.type)
          })
          return _.uniq(evTypes)
      }
  },
}
</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

label
    padding: 0
    margin: 0

.type
    font-size: .5em
    float: left
    white-space: nowrap;
    // font-size

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
