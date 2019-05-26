<template lang="pug">
.day
  .date {{ day }}
  template(v-for='t in taskers')
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
      taskers(){
          let taskers = []
          this.todaysEvents.forEach( ev => {
              this.$store.state.members.forEach(member => {
                  if (ev.memberId === member.memberId){
                      taskers.push(member.name)
                  }
              })
          })
          return _.uniq(taskers)
      }
  },
}
</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

label
    padding: 0
    margin: 0
    color: accent2

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
