<template lang='pug'>

.priorities
    .empty(v-if='$store.getters.getPriorities.length < 1')
        img.bdoge(src='../../assets/images/buddadoge.svg')
    template.clearboth(v-for='(t, i) of $store.getters.getPriorities')
        hyperpriority(:taskId='t')
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
    goIn(tId){
        this.$router.push("/task/" + tId)
    },
    cardInputSty(t) {
      let color = this.getTask(t).color
      return {
          redwx : color == 'red',
          bluewx : color == 'blue',
          greenwx : color == 'green',
          yellowwx : color == 'yellow',
          purplewx : color == 'purple',
          blackwx : color == 'black',
      }
    },
    checkAllocated(t){
        let allocatedAmount = 0
        if(!Array.isArray(this.card.allocations)) {
            return -1
        }
        let parent = this.getTask(this.card.taskId)
        parent.allocations.forEach(als => {
            if (als.allocatedId === t){
                allocatedAmount = als.amount
            }
        })
        return allocatedAmount
    },
    allocate(tId, inId){
      this.$store.dispatch("makeEvent", {
        type: 'task-allocated',
        taskId: inId,
        allocatedId: tId
      })
    },
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
    }
  },
  computed: {
      card(){
          return this.$store.getters.context
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

.shipcontainer
    // position: absolute
    display: inline
    height: 4em
    clear: both

.singleship
    position: absolute
    width: 3.3724em
    cursor: pointer

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
    opacity: 0.6
.subpriority
    margin-left: 2em
    width: calc(100% - 2em)
</style>
