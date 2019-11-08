<template lang='pug'>

.upgrades
    div
        div.endpad(v-if='!isDoge')
            h2.yellowtx(v-if='b.guild') {{ b.guild }}
            .projects(v-if='subguilds.length > 0')
                h3.bluetx projects
                ul.none
                    li.spaced(v-for='p in subguilds')
                        span(@click='goIn(p.taskId)')
                            img.floatleft(src='../../assets/images/badge.svg')
                        span(@click='goIn(p.taskId)')
                            span.nl.gui.bluetx {{ p.guild }}
                        //- span(v-for='c in completions(p)'  @click='goIn(c.taskId, p.taskId)'    :class=  '  { padleft : getSubPriorities(p.taskId).length > 0 }')
                        //-     .plain.checkmark.tooltip(:class="cardInputSty(c.color)") ☑
                        //-         linky.tooltiptext(:x='c.name')
                        //- linky.description(:x='p.name')
            current(v-for='n in $store.getters.hodlersByCompletions'  :memberId='n.taskId'  :b='b'    :inId='ugly'  :completions='n.contextCompletions')
            current(v-for='n in holdOrSent'  :memberId='n'  :b='b'  :inId='ugly')
            .box.morepad
                div.dogep.spinslow
                    .tooltip
                        img(:class="{ungrabbedcoin : !isGrabbed}" src='../../assets/images/dogepepecoin.png' @click='toggleGrab')
                        .tooltiptext.hodlsuggest(v-if='!isGrabbed') click to hodl
                        .tooltiptext.hodlsuggest(v-else) hodled ~ click to dump
                    p.hodlcount(:class="{grabbedhodlcount: isGrabbed}") {{ b.deck.length }}
        div.endpadtwo(v-else)
            .title.yellowtx missions
            ul.none
                template(v-for='g in (showAllGuilds ? missions : missions.slice(0, 5))')
                    li.spaced
                        span(@click='goIn(g.taskId)')
                            img.floatleft(src='../../assets/images/badge.svg')
                        span(@click='goIn(g.taskId)')
                            span.nl.gui.yellowtx {{ g.guild }}
                        span(v-for='c in completions(g)'  @click='goIn(c.taskId, g.taskId)'    :class=  '  { padleft : getSubPriorities(g.taskId).length > 0 }')
                            .plain.checkmark.tooltip(:class="cardInputSty(c.color)") ☑
                                linky.tooltiptext(:x='c.name')
                        linky.description(:x='g.name')
                .more(v-if='missions.length > 5 && !showAllGuilds'  @click='showGuilds') +{{       $store.getters.myGuilds.length - 5 }}
                .more(v-else-if='missions.length > 5 && showAllGuilds'  @click='hideGuilds') ( )
</template>

<script>
import Current from '../Members/Current'
import Linky from '../Card/Linky'
import SoundFX from '../../modules/sounds'

export default {
    components:{
        Linky,  Current,
    },
    mounted() {
        this.$store.commit('stopLoading')
    },
    data(){
        return {
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

            this.$store.dispatch("goIn", {panel, top, parents})
        },
        playPageTurn(){
            var flip = new Audio(require('../../assets/sounds/myst158.wav'))
            flip.volume = flip.volume * 0.3
            flip.play()
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
            let card = this.$store.getters.hashMap[taskId]
            if(card && card.priorities){
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
        },
        toggleGrab() {
            if (this.isGrabbed) {
                SoundFX.playTwinkleDown()
                this.$store.dispatch("makeEvent", {
                    type: 'task-dropped',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                })
            } else {
                SoundFX.playTwinkleUp()
                this.$store.dispatch("makeEvent", {
                    type: 'task-grabbed',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                })
            }
        },
    },
    computed: {
        missions(){
            let missions = []
            if (this.isDoge){
              if (this.isDoge.memberId === this.$store.getters.member.memberId){
                return this.$store.getters.myGuilds
              } else {
                return this.$store.state.tasks.filter(g => g.guild && g.deck.indexOf(this.isDoge.memberId) > -1)
              }
            }
        },
        holdOrSent(){
            let deck = this.b.deck
            let passedTo = this.b.passed.map(p => p[1])
            let allHoldPassed = deck.concat( passedTo )
            return allHoldPassed.filter(x => !this.$store.getters.hodlersByCompletions.some(p => p.taskId === x))
        },
        b(){
            return this.$store.getters.contextCard
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
        isGrabbed(){
          return this.b.deck.indexOf( this.$store.getters.member.memberId ) > -1
        },
        subguilds() {
            return this.$store.state.tasks.filter(p => p.guild && this.b.subTasks.concat(this.b.priorities, this.b.completed).indexOf(p.taskId) > -1)
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

.gui.bluetx
    font-size: 1.3em
    
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
    font-size: 1.5em

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

.checkwrapper
    overflow: auto
    width: 100%

.checkmark
    font-size: 2em
    display: inline-block
    cursor: pointer

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
    
.projects
    float: right
    max-width: 33%
    border: solid 1px wrexblue
    border-radius: 0.5em
    margin-top: -0.5em
    margin-right: 1em
    padding: 0 0.5em
    
.projects h3
    text-align: center
    margin-top: 0.5em
    
.projects .floatleft
    max-height: 1.3em
    margin-top: 0
    margin-right: 0.5em
    
.projects ul
    margin-left: -2em
</style>
