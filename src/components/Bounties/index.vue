<template lang='pug'>

#tasks
    shared-title(title='Commons Incentivized Hypercards')
    .row
      .six.columns
          bounty-card(v-for="b in tasks", :b="b")
      .six.columns
          bounty-card(v-for="b in projects", :b="b")
</template>

<script>

import BountyCard from "./BountyCard"
import SharedTitle from '../slotUtils/SharedTitle'
import CrazyBtn from '../slotUtils/CrazyBtn'
import calculations from '../../calculations'

export default {
  computed: {
      projects(){
          let tasks = this.$store.state.tasks.filter(t => {
              return t.oneTime && calculations.calculateTaskPayout(t)
          })
          return tasks.sort( (first, second) => {
              let f = calculations.calculateTaskPayout(first)
              let s = calculations.calculateTaskPayout(second)
              return f < s
          })
      },
      tasks(){
          let tasks = this.$store.state.tasks.filter(t => {
              return !t.oneTime && calculations.calculateTaskPayout(t)
          })

          return tasks.sort( (first, second) => {
              let f = calculations.calculateTaskPayout(first)
              let s = calculations.calculateTaskPayout(second)
              return f < s
          })
      }
  },
  components:{
      SharedTitle,
      CrazyBtn,
      BountyCard,
  },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'

#tasks
    width: 100%

tr
    border-color: accent4
    border-top-style: solid
    border-bottom-style: solid
    border-width: 3px
    vertical-align:middle

thead
    tr
        text-align: center

td
    vertical-align: middle
    color: accent2
    font-size: 1.34em
    text-align: center

li
    text-align: left

img
    height: 3.9em

table
    text-align:center
    width: 100%
th
    font-family: sans-serif
    font-weight: lighter
    font-size: 1.1em
    color: accent1
    border-color: accent1

td
    color: accent3

.padding
    padding: 1.987654321em

li
    margin-left: 1em

</style>
