<template lang='pug'>

.priorities
    img.bdoge(v-if='priorities.length < 1'  src='../../assets/images/buddadoge.svg')
    template.clearboth(v-for='(t, i) of priorities')
      .row.priority.opencard(v-if='$store.state.context.action === t')
          img.singleship.open(@click='allocate(t)'  src='../../assets/images/singleship.svg')
          .allocated(v-if='allocated > 0') {{ allocated(t) }}
          div(@click.stop='deaction')
              hypercard(:b="getTask(t)", :c="priorities",  :inId="$store.getters.contextCard.taskId")
      .row.priority(v-else)
          img.singleship(@click='allocate(t)'  src='../../assets/images/singleship.svg')
          .allocated(v-if='allocated > 0') {{ allocated(t) }}
          hyperpriority(:taskId='t')
      .row.subpriority(v-for='(st, j) of getSubPriorities(t)')
          .clearboth(v-if='$store.state.context.action === st')
              hypercard(:b="getTask(st)", :c="priorities",  :inId="t")
          hyperpriority(v-else,  :taskId='st'  :c='getCard(t).priorities')
          .row.subpriority(v-for='(st2, k) of getSubPriorities(st)')
              .clearboth(v-if='$store.state.context.action === st2')
                  hypercard(:b="getTask(st2)", :c="priorities",  :inId="st")
              hyperpriority(v-else,  :taskId='st2'  :c='getCard(st).priorities')
    div.clearboth
</template>

<script>

import Hypercard from '../Card'
import Hyperpriority from './Priority'
import HyperpriorityAction from './PriorityAction'

export default {
  data(){
      return {
          action: false,
      }
  },
  methods:{
    setAction(ii){
        console.log('set action called ', ii)
        if (ii === this.action){
            return this.action = false
        }
        this.action = ii
    },
    getTask(taskId){
        return this.$store.getters.hashMap[taskId]
    },
    nextAction(){
        this.action = this.getPriorities[(this.getPriorities.indexOf(this.action) + 1) % this.getPriorities.length]
    },
    nextSubAction(inId){
        let context = this.getSubPriorities(inId)
        console.log("context is ", context)
        this.action = context.slice()[(context.slice().indexOf(this.action) + 1) % context.slice().length]
    },
    getSubPriorities(taskId){
      let card = this.$store.getters.hashMap[taskId]
      if(card && card.priorities){
          return card.priorities.slice().reverse()
      }
    },
    allocate(taskId){
      this.$store.dispatch("makeEvent", {
        type: 'task-allocated',
        taskId: this.$store.getters.contextCard.taskId,
        allocatedId: taskId
      })
    },
    deaction(){
      this.$store.commit("setAction", false)
    },
    getCard(taskId){
        return this.$store.getters.hashMap[taskId]
    },
  },
  computed:{
      priorities(){
          return this.$store.getters.getPriorities.slice().reverse()
      },
      allocated(taskId){
          let allocatedAmount = 0
          this.$store.state.tasks.forEach(t => {
              if(Array.isArray(t.allocations)) {
                t.allocations.forEach(als => {
                    if (als.allocatedId === taskId){
                        allocatedAmount += als.amount
                    }
                })
              }
          })
          return allocatedAmount
      },
  },
  components:{
      Hyperpriority,
      HyperpriorityAction,
      Hypercard,
  },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/button'

.priorities
    padding-bottom: 0.6em
    padding-top: 0.1em

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

.shipcontainer
    // position: absolute
    // display: inline

.allocated
    position: absolute
    padding-left: 0.25em
    width: 2em
    text-align: center
    font-size: 0.95em
    margin-top: 0.5em
    color: white
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5)
    font-size: 1.5em
    pointer-events: none

.onelinecard
    width: 100%
    margin-left: 3em
    padding: 0.5em

.top
    z-index: 9001

.empty
    height: 3em
    padding-top: 0.6em
    padding-bottom: 0.2em

.bdoge
    width: 100%
    opacity: 0.8
    height: 17em

.priority
    margin-left: 4em
    width: calc(100% - 4em)
    position: relative
    
.subpriority
    margin-left: 6em
    width: calc(100% - 6.5em)

.redwx
    padding-top: 0.1em
    padding-left: 2em
    padding-right: 0.4em
    padding-bottom: 0.4em
    margin-bottom: 0.7em
    margin-top: 0.7em

.singleship
    position: absolute
    width: 3.3724em
    margin-left: -4em
    cursor: pointer
    top: -0.3em

.opencard
    padding-top: 0.5em
    width: calc(100% - 4.5em)
    
.open
    top: 36%
    
.allocated
    position: absolute
    padding-left: 0.25em
    width: 2em
    text-align: center
    font-size: 0.95em
    margin-top: 0.5em
    color: white
    text-shadow: 2px 2px 2px rgba(0.05, 0.05, 0.05, 0.5)
    font-size: 1.5em
    pointer-events: none

</style>
