<template lang='pug'>

.upgrades
    .row
        .three.grid(@click='select(0)', :class='{selected: show === 0}')
            img.upgrade(src='../../assets/images/boatblack.svg')
        .three.grid(@click='select(1)', :class='{selected: show === 1}')
            img.upgrade(src='../../assets/images/guildwithwhitenobkgrnd.png')
        .three.grid(@click='select(2)', :class='{selected: show === 2}')
            img.upgrade(src='../../assets/images/treasurechestnobkgrndwhiteD.png')
        .three.grid(@click='select(3)', :class='{selected: show === 3}')
            img.upgrade(src='../../assets/images/timecubewithwhite.png')
    .row.mainbg
      transition(name='slide-fade'  mode='out-in')
          div(v-if='show === 0')
              priorities(:taskId="b.taskId", :inId='b.taskId')
          template(v-if='show === 1')
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
                        router-link.nl(:to='"/task/" + g.taskId')
                            span.gui {{ g.guild }}
                            div.description {{ g.name }}
                  .gui.title {{isDoge.name}}'s vouches
                      vouch(v-for='n in nameList'  :memberId='n'  :b='b'  :inId='ugly')
          template(v-if='show === 2')
            .box
              form-box.centerform(:btntxt='"invoice " + payreqAmount'  event='invoice-created'  v-bind:data='invoiceCreate')
                  h2 send points here
                  label.adjusttop.fl choose amount:
                  input.smallbox.fr(v-model='payreqAmount')
              pay-req(v-if='b.bolt11'  :bolt11='b.bolt11')
              form-box.centerform(v-if='!b.address'   btntxt='get address'  event='address-updated'  v-bind:data='addressUpdate')
              pay-address(v-else   :address='b.address')
          template(v-if='show === 3')
            div
              div(v-if='isDoge || b.guild')
                  task-calendar(:inId='b.taskId')
              .box(v-else)
                  h2 timecube
                  .gui(v-if='calcTime') {{ calcTime.slice(0,19) }}
                  resource-book(:tId='b.taskId')
</template>

<script>

import request from 'superagent'
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
import Actions from '../Card/Actions'
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
        BountyCreate, PreviewDeck, Actions,
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
        select(x){
            if (this.show === x){
                this.show = false
            } else {
                this.show = x
            }
        },
        toggleGrab(){
          if (this.isGrabbed) {
            request
            .post('/events')
            .set('Authorization', this.$store.state.loader.token)
            .send({
              type: 'task-dropped',
              taskId: this.b.taskId,
              memberId: this.$store.getters.member.memberId,
            })
            .end((err,res)=>{

            })
          } else {
            request
            .post('/events')
            .set('Authorization', this.$store.state.loader.token)
            .send({
              type: 'task-grabbed',
              taskId: this.b.taskId,
              memberId: this.$store.getters.member.memberId,
            })
            .end((err,res)=>{

            })
            if(!this.isDecked) {
              request
              .post('/events')
              .set('Authorization', this.$store.state.loader.token)
              .send({
                type: 'task-sub-tasked',
                subTask: this.b.taskId,
                taskId: this.$store.getters.memberCard.taskId,
              })
              .end((err,res)=>{

              })
            }
          }
        }
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
        cardInputSty(){
            if (this.calcTask) return {
                redwx : this.calcTask.color == 'red',
                bluewx : this.calcTask.color == 'blue',
                greenwx : this.calcTask.color == 'green',
                yellowwx : this.calcTask.color == 'yellow',
                purplewx : this.calcTask.color == 'purple',
                blackwx : this.calcTask.color == 'black',
            }
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
</style>
