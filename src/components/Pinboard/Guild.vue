<template lang='pug'>

.guild
    .row.greenwx
        .eight.grid.cur(@click='toTask(g.taskId)')
            h3.big
                img.fl(src='../../assets/images/spartan.png')
                span - {{ g.guild }}
            p.big {{ g.name }}
        .four.grid
            preview-deck(:taskId='g.taskId')
</template>

<script>

import Hypercard from "../Card"
import BountyCard from "../Bounties/BountyCard"
import request from "superagent"
import SharedTitle from '../slotUtils/SharedTitle'
import CrazyBtn from '../slotUtils/CrazyBtn'
import calculations from '../../calculations'
import FormBox from '../slotUtils/FormBox'
import TaskCreate from '../forms/TaskCreate'
import PreviewDeck from '../Deck/PreviewDeck'
import HyperDeck from '../Deck/HyperDeck'

export default {
  props: ['g'],
  components:{
      Hypercard,
      SharedTitle,
      CrazyBtn,
      BountyCard,
      FormBox,
      PreviewDeck,
      HyperDeck,
      TaskCreate,
  },
  methods: {
      toTask(id){
          this.$router.push('/task/' + id )
      },
      getTop(idList){
          let deck = idList.map( id => this.getTask(id) )
          let r = deck.filter( d => d.color === 'red').sort( (a, b) => a.deck.length < b.deck.length ).slice(0,1)
          let b = deck.filter( d => d.color === 'blue').sort( (a, b) => a.deck.length < b.deck.length ).slice(0,1)
          let g = deck.filter( d => d.color === 'green').sort( (a, b) => a.deck.length < b.deck.length ).slice(0,1)
          let y = deck.filter( d => d.color === 'yellow').sort( (a, b) => a.deck.length < b.deck.length ).slice(0,1)
          let p = deck.filter( d => d.color === 'purple').sort( (a, b) => a.deck.length < b.deck.length ).slice(0,1)
          return _.concat([], b, r, y, g, p)
      },
      disolve(taskId){
          return {
              taskId,
              guild: '',
          }
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
      getGuildCards(g){
          let gCards = []
          return this.$store.state.tasks.forEach(t => {
              return t.deck.some(m => {
                  let msg = (m === g)
                  if (msg){
                      gCards.push(gCards)
                  }
                  return msg
              })
          })
      }
  }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'

.guild
    padding: 1.7em
    width: 100%
    color: white
    #vine
        width: 100%
        height: auto

.brd
    border-color: green
    border-style: dashed
    border-width: 3px

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

#fl
    float: right

.cur
    cursor: pointer;
    padding: 1.123em

.big
    font-size: 1.345em


</style>
