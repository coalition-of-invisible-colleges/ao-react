<template lang='pug'>

.priorities
    img.bdoge(v-if='priorities.length < 1'  src='../../assets/images/buddadoge.svg')
    template.clearboth(v-for='(t, i) of priorities'  :key='t')
      .row.priority.opencard(v-if='$store.state.context.action === t')
          .allocated.openallocated(v-if='allocated(t) > 0') {{ allocated(t) }}
          img.singleship.open(@click='allocate(t)'  src='../../assets/images/singleship.svg')
          div(@click.stop='deaction')
              hypercard(:b="getCard(t)", :c="priorities",  :inId="$store.getters.contextCard.taskId")
      .row.priority(v-else)
          .allocated(v-if='allocated(t) > 0') {{ allocated(t) }}
          img.singleship(@click='allocate(t)'  src='../../assets/images/singleship.svg')
          div(@dblclick.stop='goIn($store.getters.contextCard.priorities)'  @click='setAction(t)')
              hyperpriority(:taskId='t')
      .row.subpriority(v-for='(st, j) of getSubPriorities(t)'   :key='st')
          .clearboth.opensubcard(v-if='$store.state.context.action === st'  @click='deaction')
              hypercard(:b="getCard(st)", :c="getCard(st).priorities",  :inId="t")
          div(v-else  @dblclick.stop='goIn(st, getcard(st).priorities, [ t ])'  @click='setAction(st)')
              hyperpriority(:taskId='st'  :c='getCard(t).priorities')
          .row.subsubpriority(v-for='(st2, k) of getSubPriorities(st)'  :key='st2')
              .clearboth.opensubcard(v-if='$store.state.context.action === st2'  @click='deaction')
                  hypercard(:b="getCard(st2)", :c="getCard(st2).priorities",  :inId="st")
              div(v-else  @dblclick.stop='goIn(st2, getCard(st).priorities, [ t, st ])'  @click='setAction(st2)')
                  hyperpriority(:taskId='st2'  :c='getCard(st).priorities')
    div.clearboth
</template>

<script>

import Hypercard from '../Card'
import Hyperpriority from './Priority'
import HyperpriorityAction from './PriorityAction'
import _ from 'lodash'

export default {
  data(){
      return {
          action: false,
      }
  },
  methods:{
    setAction(taskId){
        this.$store.commit("setAction", taskId)
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
    goIn(taskId, panel, parents){
        if (panel && panel.length && panel.length > 0){

        } else {
            panel = [taskId]
        }

        let top = panel.indexOf(taskId)

        if (top > -1){

        } else {
            top = 0
        }

        this.$store.dispatch("goIn", {
            inId: this.inId,
            top,
            panel,
            parents
        })

        this.$router.push('/task/' + taskId)
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
  computed:{
      priorities(){
          return this.$store.getters.getPriorities.slice().reverse()
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
    left: -3.05em
    width: 3.3724em
    text-align: center
    color: white
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5)
    font-size: 1.5em
    pointer-events: none
    z-index: 7
    margin-top: 0.1em

.openallocated
    top: 36%
    margin-top: 0.3em

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
    margin-left: calc(3.3724em * 2)
    width: calc(100% - (3.3724em* 2))

.subsubpriority
    margin-left: 3.3724em
    width: calc(100% - 3.3724em)

.singleship
    position: absolute
    width: 3.3724em
    margin-left: -4em
    cursor: pointer
    top: -0.3em

.opencard
    width: calc(100% - 4.5em)
    margin-top: 0.5em

.opensubcard
    width: calc(100% - 0.5em)
    margin-top: 0.5em

.open
    top: 36%

</style>
