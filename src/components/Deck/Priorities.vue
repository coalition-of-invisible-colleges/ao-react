<template lang='pug'>

.priorities
    template.clearboth(v-for='(t, i) of getPriorities')
      .row
        .shipcontainer
            img.singleship(@click='allocate(t)'  src='../../assets/images/singleship.svg')
            .allocated {{ checkAllocated(t) }}
            hyperpriority(:taskId='t')
        //- span.agedwrapper(:class="cardInputSty(t)")
        //-     .agedbackground.freshpaper
        //-     span.onelinecard {{ getTask(t).name }}
        //- hypercard(v-if='action === i'  :b='getTask(t)'  :inId='taskId')
        //- img.singleship(@click='allocate(t)'  src='../../assets/images/vinebtn.svg')
        //- hyperpriority-action(v-if='action === i', :taskId='t', :nextAction='nextAction', :inId='taskId')
    div.clearboth
</template>

<script>


import request from 'superagent'
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
        console.log("checkAllocated. this.card = ", this.card)
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
    allocate(tId){
      console.log(tId, 'allocate called')
      request
          .post('/events')
          .set('Authorization', this.$store.state.loader.token)
          .send({
              type: 'task-allocated',
              taskId: this.taskId,
              allocatedId: tId
          })
          .end((err,res)=>{
              console.log({err, res, tId})
          })
    },
    setAction(ii){
        if (ii === this.action){
            this.action = -1
            return
        }
        this.action = ii
    },
    getTask(taskId){
        return this.$store.getters.hashMap[taskId]
    },
    nextAction(){
        this.action = (this.action + 1) % this.getPriorities.length
    }
  },
  computed: {
      card(){
          return this.$store.getters.hashMap[this.taskId]
      },
      getPriorities(){
          if (this.card && this.card.priorities){
              return this.card.priorities.slice().reverse()
          }
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

.shipcontainer
    // position: absolute
    display: inline
    height: 4em
       
.singleship
    position: absolute
    width: 3.3724em

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
    
</style>
