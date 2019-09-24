<template lang='pug'>

.upgrades
    //- .row
    //-     .three.grid.tab(@click='select(0)', :class='{selected: $store.state.upgrades.mode === "boat"}')
    //-         img.upgrade(src='../../assets/images/boatblack.svg')
    //-     .three.grid.tab(@click='select(1)', :class='{selected: $store.state.upgrades.mode === "badge"}')
    //-         img.upgrade(src='../../assets/images/badge.svg')
    //-     .three.grid.tab(@click='select(2)', :class='{selected: $store.state.upgrades.mode === "bounty"}')
    //-         img.upgrade(src='../../assets/images/bounty.svg')
    //-     .three.grid.tab(@click='select(3)', :class='{selected: $store.state.upgrades.mode === "timecube"}')
    //-         img.upgrade(src='../../assets/images/timecube.svg')
    .row
      .mainbg(:class='{ lightbg : $store.state.upgrades.mode === "boat" }')
        transition(name='slide-fade'  mode='out-in')
            div(v-if='$store.state.upgrades.mode === "boat"')
                priorities(:key='$store.state.context.action')
            template(v-if='$store.state.upgrades.mode === "badge"')
              div
                div.endpad(v-if='!isDoge')
                    h2.yellowtx(v-if='b.guild') {{ b.guild }}
                    current(v-for='n in nameList'  :memberId='n'  :b='b'  :inId='ugly')
                    .box.morepad
                        div.dogep.spinslow
                            .tooltip
                                img(:class="{ungrabbedcoin : !isGrabbed}" src='../../assets/images/dogepepecoin.png' @click='toggleGrab')
                                .tooltiptext.hodlsuggest(v-if='!isGrabbed') click to hodl
                                .tooltiptext.hodlsuggest(v-else) hodled ~ click to dump
                            p.hodlcount(:class="{grabbedhodlcount: isGrabbed}") {{ b.deck.length }}
                div.endpadtwo(v-else)
                    .gui.title.yellowtx missions
                    ul.none
                        template(v-for='g in (showAllGuilds ? dogeGuilds : dogeGuilds.slice(0, 5))')
                            li.spaced
                                span(@click='goIn(g.taskId)')
                                    img.floatleft(src='../../assets/images/badge.svg')
                                span(@click='goIn(g.taskId)')
                                    span.nl.gui.yellowtx {{ g.guild }}
                                span(v-for='b in getSubPriorities(g.taskId)'  @click='goIn(b, g.taskId)')
                                    .tooltip.boat
                                        img.tinyboat(src='../../assets/images/boatbtnselected.svg')
                                        linky.tooltiptext(:x='shortName(getCard(b).name)')
                                span(v-for='c in completions(g)'  @click='goIn(c.taskId, g.taskId)'  :class='{ padleft : getSubPriorities(g.taskId).length > 0 }')
                                    .plain.checkmark.tooltip(:class="cardInputSty(c.color)") ☑
                                        linky.tooltiptext(:x='c.name')
                                linky.description(:x='g.name')
                        .more(v-if='dogeGuilds.length > 5 && !showAllGuilds'  @click='showGuilds') +{{ dogeGuilds.length - 5 }}
                        .more(v-else-if='dogeGuilds.length > 5 && showAllGuilds'  @click='hideGuilds') ( )
            template(v-if='$store.state.upgrades.mode === "bounty"')
                .padded
                    div(v-if='$store.state.cash.info.alias')
                        .togglepayments
                            //- (v-if='!$store.state.upgrades.payment')
                            button.submode(@click='togglePayment(0)', :class='{thickborder: $store.state.upgrades.payment === "bitcoin" }')
                                img.max(src='../../assets/images/bitcoin.svg')
                            button.submode(@click='togglePayment(1)', :class='{thickborder: $store.state.upgrades.payment === "lightning" }')
                                img.max(src='../../assets/images/lightning.svg')
                        div(v-show='$store.state.upgrades.payment === "bitcoin"')
                            div(v-if='b.address')
                                pay-address(:address='b.address')
                        div(v-show='$store.state.upgrades.payment === "lightning"')
                            form-box.centerform(:btntxt='"invoice " + payreqAmount'  event='invoice-created'  v-bind:data='invoiceCreate')
                                label.adjusttop.fl choose amount:
                                input.smallbox.fr(v-model='payreqAmount')
                            div(v-if='b.bolt11')
                                pay-req(:bolt11='b.bolt11')
                    div.suggest(v-else) no lightning node :(
            template(v-if='$store.state.upgrades.mode === "timecube"')
              .mainbkg
                div(v-if='isDoge || b.guild')
                    task-calendar(:inId='b.taskId')
                div(v-else-if='!$store.state.upgrades.dimension')
                    .togglepayments
                        button.submode(@click='toggleDimension(0)', :class='{thickborder: $store.state.upgrades.dimension === "time" }')
                            img.max(src='../../assets/images/calendar.svg')
                .box(v-else)
                    h2 cube
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
import Linky from '../Card/Linky'

export default {
    components:{
        SharedTitle, Current, TaskCreate,
        HyperDeck, Hypercard, GuildCreate,
        BountyCreate, PreviewDeck,
        ResourceBook, FormBox, Tag, PayReq,
        PayAddress, FancyInput, Current, Priorities,
        TaskCalendar, Linky
    },
    data(){
        return {
            show: 0,
            payreqAmount: '',
            showAllGuilds: false,
        }
    },
    methods: {
        goIn(taskId, guild = undefined){
            this.playPageTurn()
            let parents = []
            let panel = [taskId]
            let top = 0

            let t = this.$store.getters.hashMap[taskId]
            let panelColor = this.$store.getters[t.color]
            let topColor = panelColor.indexOf(taskId)

            if (topColor > -1){
                panel = panelColor
                top = topColor
            }

            if (this.$store.getters.contextCard.taskId){
                parents.push(this.$store.getters.contextCard.taskId)
            } else if (this.$store.getters.memberCard.taskId){
                parents.push(this.$store.getters.memberCard.taskId)
            }

            if(guild) parents.push(guild)

            console.log('going into the:',  {panel, top, parents})

            this.$store.dispatch("goIn", {panel, top, parents})
        },
        playPageTurn(){
            var flip = new Audio(require('../../assets/sounds/myst158.wav'))
            flip.volume = flip.volume * 0.3
            flip.play()
        },
        togglePayment(x){
            let payModes = ['bitcoin', 'lightning']
            if(this.$store.state.upgrades.payment === payModes[x]) {
                this.$store.commit("closePayMode")
                return
            }
            this.$store.commit("setPayMode", x)
            if(x === 0) {
                console.log("address is ", this.$store.getters.contextCard.address)
                if(!this.$store.getters.contextCard.address) {
                    this.$store.dispatch('makeEvent', {
                        type: 'address-updated',
                        taskId: this.$store.getters.contextCard.taskId
                    })
                }
            }
        },
        toggleDimension(x){
            if(this.$store.state.upgrades.dimension === x) {
                this.$store.commit("closeDimension")
                return
            }
            this.$store.commit("setDimension", x)
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
        getSubPriorities(taskId){
            console.log("getSubPriorities")
            let card = this.$store.getters.hashMap[taskId]
            if(card && card.priorities){
                console.log("length is ", card.priorities.length)
                console.log("priorities is ", card.priorities)
                return card.priorities.slice().reverse()
            }
        },
        getCard(taskId){
            return this.$store.getters.hashMap[taskId]
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
        showGuilds(){
            this.showAllGuilds = true
        },
        hideGuilds(){
            this.showAllGuilds = false
        },
        shortName(name) {
            let limit = 280
            let shortened = name.substring(0, limit)
            if(name.length > limit) {
                shortened += '…'
            }
            return shortened
        }
    },
    computed: {
        b(){
            return this.$store.getters.contextCard
        },
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
            let spot = this.$store.state.cash.spot
            let amount = calcs.cadToSats( this.payreqAmount, spot)
            console.log("calculated:", {spot, amount }, "from payreqAmount", this.payreqAmount,  this.$store.state.cash)
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
@import '../../styles/spinners'

.nl
    text-decoration:none

.padded
    padding: 1em

.upgrades
    width: 100%

.tab
    padding-top: .4321em
    height: 5em

.upgrade
    height: 3.7em
    cursor: pointer

.selected
    background: main
    border-radius: 40px 40px 0 0
    padding-bottom: 0.654321em
    border-style: dashed
    border-width: 2px
    border-color: softGrey


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


.mainbg
    background: main


.lightbg
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
    padding: 1em 0

.box.morepad
    //padding: 2em 0
    //margin-left: 2em

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
    cursor: pointer

.row .three
    height: 5em

.dogep
    height: 6em
    width: 6em
    cursor: pointer
    position: relative
    left: calc(50% - 3em)

.dogep img
    height: 100%
    width: 100%

.spaced
    margin-bottom: 1em
    clear: both

.floatleft
    height: 100%
    float: left
    clear: both
    max-height: 3.3em
    margin-right: 1em
    cursor: pointer
    margin-top: 0.3em
    
.title
    text-align: center

.description
    color: white
    margin-bottom: 1em
    margin-left: 4.3em

.box
    width: 100%
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
    color: white
    margin-top: 0
    //font-weight: normal

.checkwrapper
    overflow: auto
    width: 100%

.checkmark, .tinyboat
    font-size: 2em
    display: inline-block
    cursor: pointer

.boat
    display: inline-block
    font-size: 2em
    
.tinyboat
    height: 0.35em
    position: relative
    top: 0.01em
    
.plain
    text-decoration: none

.togglepayments
    margin: 0
    padding: 0
    text-align: center

.thickborder
    border-style: solid
    border-color: green
    border-width: 4px

.mainbkg
    background: main

.hodlcount
    position: relative
    left: calc(50% - 1.07em)
    top: -3em
    text-align: center
    width: 35px
    bottom: calc(0.75em + 9px)
    padding-bottom: 0
    margin-bottom: 0
    font-weight: bold
    color: rgba(255, 255, 255, 0.75)
    pointer-events: none
    font-size: 2.5em

.grabbedhodlcount {
    opacity: 1
}

.submode
    height: 6em
    width: 6em
    margin-bottom: 1em
    margin-top: 1em
    background-color: rgba(0, 0, 0, 0)

.max
    height: 100%
    width: 100%

.endpad
    padding-top: 1em
    padding-bottom: 1em
    padding-right: 0
    padding-left: 1em
    
.endpadtwo
    padding-top: 1em
    padding-bottom: 0.5em

.suggest
    color: rgba(255, 255, 255, 0.4)
    font-style: italic
    font-size: 1.2em
    text-align: center

.hodlsuggest, .dogep .hodlsuggest
    font-size: 1.15em
    
.none
    list-style-type: none
    margin-left: -1em
    
.gui.yellowtx
    margin-right: 0.5em
    
.more
    text-align: center
    background-color: rgba(22, 22, 22, 0.4)
    display: inline-block;
    border-width: 2px
    //border-color: rgba(255, 255, 255, 0.68)
    //border-style: solid
    padding: 0.5em
    margin: 0
    font-size: 1em
    opacity: 0.6
    color: white
    text-align: center
    width: calc(100% - 2.25em)
    cursor: pointer
    
.more:hover
    background-color: rgba(66, 66, 66, 0.4)

ul
    margin-block-end: 0
    
.padleft
    margin-left: 0.36em
</style>
