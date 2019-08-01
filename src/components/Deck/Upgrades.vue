<template lang='pug'>

.upgrades
    .row
        .three.grid(@click='select(0)', :class='{selected: $store.state.upgrades.mode === "boat"}')
            img.upgrade(src='../../assets/images/boatblack.svg')
        .three.grid(@click='select(1)', :class='{selected: $store.state.upgrades.mode === "badge"}')
            img.upgrade(src='../../assets/images/guildwithwhitenobkgrnd.png')
        .three.grid(@click='select(2)', :class='{selected: $store.state.upgrades.mode === "bounty"}')
            img.upgrade(src='../../assets/images/treasurechestnobkgrndwhiteD.png')
        .three.grid(@click='select(3)', :class='{selected: $store.state.upgrades.mode === "timecube"}')
            img.upgrade(src='../../assets/images/timecubewithwhite.png')
    .row.mainbg
      transition(name='slide-fade'  mode='out-in')
          div(v-if='$store.state.upgrades.mode === "boat"')
              priorities(:taskId="b.taskId", :inId='b.taskId')
          template(v-if='$store.state.upgrades.mode === "badge"')
            div
              div(v-if='!isDoge')
                  .box
                      h2(v-if='b.guild') {{ b.guild }} - guild
                      h2(v-else) hodlers
                      current(v-for='n in nameList'  :memberId='n'  :b='b'  :inId='ugly')
                      img.dogep(:class="{ungrabbedcoin : !isGrabbed}" src='../../assets/images/dogepepecoin.png' @click='toggleGrab')
                      guild-create
              div(v-else)
                  .gui.title {{isDoge.name}}'s missions
                  ul
                      template(v-for='g in dogeGuilds')
                          li.spaced
                              router-link.nl.gui(:to='"/task/" + g.taskId') {{ g.guild }}
                              router-link.plain.checkmark.tooltip(v-for='c in completions(g)'  :to='"/task/" + c.taskId'  :class="cardInputSty(c.color)") ☑
                                  .tooltiptext {{ c.name }}
                              div.description {{ g.name }}
                  .gui.title {{isDoge.name}}'s vouches
                  ul
                      li
                          vouch.gui(v-for='n in nameList'  :memberId='n'  :b='b'  :inId='ugly')
          template(v-if='$store.state.upgrades.mode === "bounty"')
              .togglepayments
                  button(@click='selectPayment(0)', :class='{thickborder: $store.state.upgrades.payment === "bitcoin" }').yellowwx bitcoin
                  button(@click='selectPayment(1)', :class='{thickborder: $store.state.upgrades.payment === "lightning" }').purplewx lightning
                  h2 create points here
                  .box(v-show='$store.state.upgrades.payment === "bitcoin"')
                      form-box.centerform(v-if='!b.address'   btntxt='get address'  event='address-updated'  v-bind:data='addressUpdate')
                      pay-address(:address='b.address')
                  .box(v-show='$store.state.upgrades.payment === "lightning"')
                      form-box.centerform(:btntxt='"invoice " + payreqAmount'  event='invoice-created'  v-bind:data='invoiceCreate')
                          label.adjusttop.fl choose amount:
                          input.smallbox.fr(v-model='payreqAmount')
                      pay-req(v-if='b.bolt11'  :bolt11='b.bolt11')
          template(v-if='$store.state.upgrades.mode === "timecube"')
            div
              div(v-if='isDoge || b.guild')
                  task-calendar(:inId='b.taskId')
              .box(v-else)
                  h2 timecube
                  .gui(v-if='calcTime') {{ calcTime.slice(0,19) }}
                  resource-book(:tId='b.taskId')
</template>

<script>

import calcs from '../../calculations'

import SharedTitle from '../slotUtils/SharedTitle'
import TaskCreate from '../forms/TaskCreate'
import HyperDeck from '../Deck/HyperDeck'
import PreviewDeck from '../Deck/PreviewDeck'
import Hypercard from '../Card'
import TaskCalendar from '../TaskCalendar/Calendar'
import GuildCreate from '../forms/GuildCreate'
import BountyCreate from '../forms/BountyCreate'
import ResourceBook from '../forms/ResourceBook'
import FormBox from '../slotUtils/FormBox'
import Tag from '../Nodes/Tag'
import PayReq from './PayReq'
import PayAddress from './PayAddress'
import FancyInput from '../slotUtils/FancyInput'
import Current from '../Members/Current'
import Priorities from './Priorities'
import Vouch from '../Members/Vouch'

export default {
    props: ['b'],
    components:{
        SharedTitle, Current, TaskCreate,
        HyperDeck, Hypercard, GuildCreate,
        BountyCreate, PreviewDeck,
        ResourceBook, FormBox, Tag, PayReq,
        PayAddress, FancyInput, Current, Priorities,
        TaskCalendar, Vouch
    },
    data(){
        return {
            show: 0,
            payreqAmount: '',
        }
    },
    methods: {
        selectPayment(x){
            this.$store.commit("setPayMode", x)
        },
        select(x){
            if (this.$store.state.upgrades.mode === "boat" && x === 0){
                return this.$store.commit("closeUpgrades")
            }

            if (this.$store.state.upgrades.mode === "badge" && x === 1){
                return this.$store.commit("closeUpgrades")
            }


            if (this.$store.state.upgrades.mode === "bounty" && x === 2){
                return this.$store.commit("closeUpgrades")
            }

            if (this.$store.state.upgrades.mode === "timecube" && x === 3){
                return this.$store.commit("closeUpgrades")
            }

            this.$store.commit("setMode", x)
        },
        toggleGrab(){
          if (this.isGrabbed) {
            this.$store.dispatch("makeEvent", {
              type: 'task-dropped',
              taskId: this.b.taskId,
              memberId: this.$store.getters.member.memberId,
            })
          } else {
            this.$store.dispatch("makeEvent", {
              type: 'task-grabbed',
              taskId: this.b.taskId,
              memberId: this.$store.getters.member.memberId,
            })
          }
        },
        completions(guild){
            let completions = []
            let allTasks = guild.subTasks.concat(guild.priorities).concat(guild.completed)
            allTasks.forEach(t => {
                let task = this.$store.getters.hashMap[t]
                if(!task || !task.claimed) return
                if(task.claimed.indexOf(this.$store.getters.member.memberId) > -1) {
                    if(completions.indexOf(task) === -1) {
                        completions.push(task)
                    }
                }
            })
            return completions
        },
        cardInputSty(c){
            return {
                redtx : c === 'red',
                bluetx : c === 'blue',
                greentx : c === 'green',
                yellowtx : c === 'yellow',
                purpletx : c === 'purple',
                blacktx : c === 'black',
            }
        },
    },
    computed: {
        dogeGuilds(){
            let guilds = []
            this.$store.getters.guilds.forEach( g => {
                if (g.deck.indexOf( this.isDoge.memberId ) > -1){
                    guilds.push(g)
                }
            })
            return guilds
        },
        isDoge(){
            let doge
            this.$store.state.members.some( m => {
                if (m.memberId ==  this.b.taskId){
                    doge = m
                    return true
                }
            })
            return doge
        },
        isDecked(){
          return this.$store.getters.memberCard.subTasks.indexOf(this.b.taskId) > -1
        },
        isGrabbed(){
          return this.b.deck.indexOf( this.$store.getters.member.memberId ) > -1
        },
        nameList(){
            return this.b.deck.map(mId => {
                return mId
            })
        },
        addressUpdate(){
            return {
                type: 'address-updated',
                taskId: this.b.taskId
            }
        },
        invoiceCreate(){
            let spot = this.$store.state.cash.spot | 10000
            let amount = calcs.cadToSats( parseInt(this.payreqAmount), spot)
            return {
                type: 'invoice-created',
                taskId: this.b.taskId,
                amount,
                label: '<3'
            }
        },
        calcTime(){
            if (this.b.book.startTs){
                let now = new Date(this.b.book.startTs)
                return now.toString()
            }
        },
        calcVal(){
            if (this.calcTask){
                let v = calcs.calculateTaskPayout(this.b)
                return parseInt(v)
            }
        },
        id(){
            return this.$route.path.split('/')[2]
        },
        calcTask(){
            let task = {}
            this.$store.state.tasks.forEach( t => {
                if (this.id === t.taskId){// XXX:
                    task = t
                }
            })
            return task
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/button'
@import '../../styles/tooltips'

.nl
    text-decoration:none

.upgrades
    width: 100%

.selected
    background: softGrey
    border-radius: 40px 40px 0 0
    padding-bottom: 0.654321em

.formlabel
    padding-top: 1em
    padding-bottom: 1em
    text-align: center

.card
    padding: 2em
    color: white
    text-align: center

p
    padding-left: .6em
    font-size:1.3em
    font-family: 'Open Sans', light, sans-serif;

a
    color: accent2

h3
    text-align: left
    font-family: 'Open Sans', light, sans-serif;

.grid
    height: 4em
    text-align: center

.upgrade
    height: 4em
    cursor: pointer

.mainbg
    background: softGrey

.fl
    float: left

.dol
    height: 4em
    opacity: 0.27

.two
    text-align: center
    padding: .4321em

.slide-fade-enter-active {
  transition: all .06s ease;
}
.slide-fade-leave-active {
  transition: all .05s ease;
}
.slide-fade-enter {
  // transform: translateY(-400px);
  opacity: 0;
}
.slide-fade-leave-to {
 // transform: translateY(-400px);
  opacity: 0;
}

.box
    padding: 1em

.ungrabbedcoin {
  opacity: 0.3
}

.dogepepecoin
    height: 3em
    float: right

.pointsinput
    width: 45%;
    margin-bottom: 1em;
    text-align: center;
    font-size: 1.5em;

.centerchildren
    text-align: center;

.gui
    font-size: 1.5em

.row .three
    height: 5em

.dogep
    height: 3em
    padding: 0 calc(50% - 1.5em)
    margin-top: 1em
    cursor: pointer

.spaced
    margin-bottom: 1em

.title
    padding: 0.5em 0.5em 0.5em 0.5em
    text-align: center

.description
    color: white

.box
    width: 75%
    margin: 0 auto

.smallbox
    width: 4em
    margin-bottom: 1em

.adjusttop
    margin-top: 0.3em

.centerform
    margin: 0 auto 1em auto

h2
    text-align: center
    margin-top: 0.5em
    color: white

.checkwrapper
    overflow: auto
    width: 100%

.checkmark
    font-size: 2em
    margin-right: 0.25em
    display: inline-block

.plain
    text-decoration: none

.togglepayments
    margin: 0
    padding: 0
    button
        width: 50%

.thickborder
    border-style: solid
    border-color: green
    border-width: 4px

</style>
