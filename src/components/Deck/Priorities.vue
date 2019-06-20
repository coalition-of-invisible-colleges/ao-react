<template lang='pug'>

.priorities
    template(v-for='(t, i) of getPriorities')
        hyperpriority-action(v-if='action === i', :taskId='t', :nextAction='nextAction', :inId='taskId')
        div(v-else   @click='setAction(i)')
            hyperpriority(:taskId='t')
    div.clearboth
</template>

<script>

import Hypercard from '../Card'
import Hyperpriority from './Priority'
import HyperpriorityAction from './PriorityAction'

export default {
  props: ['taskId'],
  data(){
      return {
          action: false,
      }
  },
  methods:{
    setAction(ii){
        if (ii === this.action){
            this.action = -1
            return
        }
        this.action = ii
    },
    getTask(taskId){
        let task
        this.$store.state.tasks.forEach( t => {
            if (taskId === t.taskId) {
                task = t
            }
        })
        return task
    },
    nextAction(){
        this.action = (this.action + 1) % this.getPriorities.length
    }
  },
  computed: {
      getPriorities(){
          let p = []
          this.$store.state.tasks.forEach( t => {
              if (this.taskId === t.taskId){
                  p = t.priorities
              }
          })
          return p.slice().reverse()
      }
  },
  components:{
      Hyperpriority,
      HyperpriorityAction,
  },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/button'

.priorities
    padding-bottom: 0.5em

button
    background: darkteal

.deck
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

.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

img
    height: 3em

.ptr
    cursor: pointer

.fr
    float: right

.fl
    float: left

.clearboth
    clear: both

</style>
