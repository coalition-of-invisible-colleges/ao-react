<template lang='pug'>

.bird(ref='wholeBird')
    div(ref='bird')
        div(v-if='$store.state.upgrades.warp === -1')
            div.birdy.faded.smallguild(v-if='!showGive && b.guild || showGive && b.guild'  :class='{ open : showGive }')
            img.birdy.faded(v-else-if='!showGive && !b.guild' src='../assets/images/send.svg')
            img.birdy(v-else  src='../assets/images/sendselected.svg')
    .play(v-if='showPlay')
            option(disabled, value='') to mission
            template(v-for='g in $store.getters.sendableGuilds')
                option(:value="g.taskId") {{ g.guild }}
                template(v-for='p in g.guilds')
                    option(:value="p.taskId") &nbsp;&nbsp;&nbsp;&nbsp;{{ p.guild }}
                    template(v-for='sp in p.guilds')
                        option(:value="sp.taskId") &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ sp.guild }}
        button.small(@click='dispatchMakeEvent(playInfo)') give
    .give(v-if='showGive')
        select(v-model='toMember')
            option(disabled, value='') to people
            option(v-for='n in $store.state.members', :value="n.memberId") {{ n.name }}
        button.small(@click='dispatchMakeEvent(passInfo)') give
    .theTitle(v-if='b.guild') {{ b.guild }}
    .count
        guild-create(v-if='showGuildCreate'  :b='b'  @closeit='toggleGuildCreate')
</template>

<script>
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import GuildCreate from './GuildCreate'
import calculations from '../calculations'

export default {
    props: ['b', 'inId'],
    components: {
        GuildCreate
    },
    data() {
        return {
            showGive: false,
            showGuildCreate: false,
            showPlay: false,
            toMember: '',
            toGuild: '',
            toAo:'',
        }
    },
    mounted() {
        let el = this.$refs.bird
        if(!el) return
        let mc = Propagating(new Hammer.Manager(el))

        let singleTap = new Hammer.Tap({ event: 'singletap', time: 400 })
        let doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, time: 400, interval: 400 })
        let tripleTap = new Hammer.Tap({ event: 'tripletap', taps: 3, time: 400, interval: 400 })
        let longPress = new Hammer.Press({ time: 400 })

        mc.add([tripleTap, doubleTap, singleTap, longPress])

        tripleTap.recognizeWith([doubleTap, singleTap])
        doubleTap.recognizeWith(singleTap)
        singleTap.requireFailure([doubleTap, tripleTap])
        doubleTap.requireFailure(tripleTap)

        mc.on('singletap', (e) => {
            this.toggleGive()
            e.stopPropagation()
        })

        mc.on('doubletap', (e) => {
            if(this.b.taskId === this.$store.getters.member.memberId) return

            this.togglePlay()
            e.stopPropagation()
        })

        mc.on('press', (e) => {
            if(this.b.taskId === this.$store.getters.member.memberId) return

            this.toggleGuildCreate()
            e.stopPropagation()
        })

        // XXX
        let Swipe = new Hammer.Swipe()
        mc.add(Swipe)
        mc.on('swipeleft', (e) => {
            e.stopPropagation()
        })
        mc.on('swiperight', (e) => {
            e.stopPropagation()
        })

        let wholeel = this.$refs.wholeBird
        if(!wholeel) return
        let wholemc = Propagating(new Hammer.Manager(wholeel))

        let wholeLongPress = new Hammer.Press({ time: 400 })

        wholemc.add([wholeLongPress])

        wholemc.on('press', (e) => {
            e.stopPropagation()
        })
    },
    methods: {
        dispatchMakeEvent(ev){
            this.$store.dispatch('makeEvent', ev)
        },
        toggleGive(){
            if(this.showGuildCreate) {
                this.toggleGuildCreate()
                return
            }
            if(this.showPlay) {
                this.togglePlay()
                return
            }
            this.showGive = !this.showGive
        },
        toggleGuildCreate(){
            if(!this.showGuildCreate) {
                this.showGive = false
                this.showPlay = false
            }
            this.showGuildCreate = !this.showGuildCreate
            if(this.showGuildCreate) {
                setTimeout(()=>{ document.getElementById('titlebox').focus() }, 1)
            }
        },
        togglePlay(){
            if(!this.showPlay) {
                this.showGive = false
                this.showGuildCreate = false
            }
            this.showPlay = !this.showPlay
        },
    },
    computed: {
        playInfo(){
            return {
                type: 'task-sub-tasked',
                taskId:  this.toGuild,
                subTask: this.b.taskId,
            }
        },
        passInfo(){
            return {
                type: 'task-passed',
                taskId: this.b.taskId,
                fromMemberId: this.$store.getters.member.memberId,
                toMemberId: this.toMember,
            }
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'
@import '../styles/tooltips'

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    color: white
    margin:10px 0
    padding:20px

.btn
    width:100%
    margin-top: 2em
    max-height: 3em

select
    background-color: lightteal
    width: 70%
    margin-left: -1.5em

select.form-control
    color: black

select.shorten
    width: 68%

.curs
    cursor: pointer;

label
    color: black
    text-align: center
    padding: 0
    margin-bottom: -50px

.birdy
    float: left
    height: .777em
    cursor: pointer

.faded
    opacity: 0.235654

.faded:hover
    opacity: 1

.smallguild
    background-image: url('../assets/images/badge.svg')
    background-repeat: no-repeat
    background-size: contain
    background-position: top left
    height: 1.67em
    width: 1.7em
    opacity: 1
    position: relative
    z-index: 10

.give, .play, .warp
    position: relative
    top: 2em
    margin-bottom: 1em
    padding-bottom: 1em
    width: 100%

.theTitle
    position: absolute
    left: 3.3em
    top: 1.3em

.small
    width: 19%
    display: inline-block
    height: 2.3em
    position: relative
    top: -0.07em

</style>
