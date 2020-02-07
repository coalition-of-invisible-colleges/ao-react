<template lang='pug'>

.bird(ref='wholeBird')
    div(ref='bird')
        div(v-if='$store.state.upgrades.warp === -1')
            div.birdy.faded.smallguild(v-if='!showGive && b.guild || showGive && b.guild'  :class='{ open : showGive }')
            img.birdy.faded(v-else-if='!showGive && !b.guild' src='../assets/images/birdbtn.svg')
            img.birdy(v-else  src='../assets/images/birdbtnselected.svg')
        div(v-else)
            div.birdy.faded.smallguild.red(v-if='!showGive && b.guild || showGive && b.guild'  :class='{ open : showGive }')
            img.birdy.faded(v-else-if='!showGive && !b.guild' src='../assets/images/birdbtn_red.svg')
            img.birdy(v-else  src='../assets/images/birdbtnselected_red.svg')
    .play(v-if='showPlay')
        div(v-if='$store.state.upgrades.warp > -1')
            select.shorten(v-model='toGuildWarp')
                option(disabled, value='') to mission
                option(v-for='n in $store.getters.warpDrive.state.members', :value="n.memberId") {{ n.name }}
            form-box.small(v-if='toGuildWarp' btntxt="give"  event='task-passed' v-bind:data='relayInfoM')
            span.sierpinskiwrapper
                sierpinski(:b='b')
            .serverLabel on {{ $store.getters.warpDrive.address }}
            .serverLabel on {{ $store.getters.warpDrive.alias }}
        select(v-else  v-model='toGuild')
            option(disabled, value='') to mission
            template(v-for='g in $store.getters.sendableGuilds')
                option(:value="g.taskId") {{ g.guild }}
                template(v-for='p in g.guilds')
                    option(:value="p.taskId") &nbsp;&nbsp;&nbsp;&nbsp;{{ p.guild }}
                    template(v-for='sp in p.guilds')
                        option(:value="sp.taskId") &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ sp.guild }}
        form-box.small(btntxt="give"  event='task-passed' v-bind:data='playInfo')
    .give(v-if='showGive')
        div(v-if='$store.state.upgrades.warp > -1')
            select.shorten(v-model='toMemberWarp')
                option(disabled, value='') to people
                option(v-for='n in $store.getters.warpDrive.state.members', :value="n.memberId") {{ n.name }}
            //- button.small(v-if='this.b.taskId !== this.$store.getters.member.memberId'  @click='give') send
            button.small(@click='migrate') send entire deck
            span.sierpinskiwrapper
                sierpinski(v-if='this.b.taskId !== this.$store.getters.member.memberId'  :b='b')
            .serverLabel on {{ $store.getters.warpDrive.address }}
        div(v-else)
            select(v-model='toMember')
                option(disabled, value='') to people
                option(v-for='n in $store.state.members', :value="n.memberId") {{ n.name }}
            form-box.small(btntxt="give"  event='task-passed' v-bind:data='passInfo')
    .warp(v-if='showWarp')
        select(v-model='toAo')
            option(disabled  value='') to AO
            option(v-for='(n, i) in $store.getters.liveConnections', :value='i') {{ n.state.cash.alias }}
        button.small(@click='setWarp') set
    .theTitle(v-if='b.guild') {{ b.guild }}
    .count
        guild-create(:editing='showGuildCreate'  :b='b'  @closeit='toggleGuildCreate')
</template>

<script>
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import FormBox from './FormBox'
import GuildCreate from './GuildCreate'
import calculations from '../calculations'
import Sierpinski from './Sierpinski'

export default {
    props: ['b', 'inId'],
    components: {
        FormBox, GuildCreate, Sierpinski
    },
    data() {
        return {
            toMemberWarp: '',
            toGuildWarp: '',
            showGive: false,
            showGuildCreate: false,
            showPlay: false,
            showWarp: false,
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

        mc.on('tripletap', (e) => {

            this.toggleWarp()
            e.stopPropagation()
        })

        mc.on('press', (e) => {
            if(this.b.taskId === this.$store.getters.member.memberId) return

            this.toggleGuildCreate()
            e.stopPropagation()
        })

        let Swipe = new Hammer.Swipe()
        mc.add(Swipe)
        mc.on('swipeleft', (e) => {
            console.log(this.phaseShift)
            e.stopPropagation()
        })

        mc.on('swiperight', (e) => {
            console.log(this.phaseShift)
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
        toggleGive(){
            if(this.showGuildCreate) {
                this.toggleGuildCreate()
                return
            }
            if(this.showPlay) {
                this.togglePlay()
                return
            }
            if(this.showWarp) {
                this.toggleWarp()
                return
            }
            this.showGive = !this.showGive
        },
        toggleGuildCreate(){
            if(!this.showGuildCreate) {
                this.showGive = false
                this.showPlay = false
                this.showWarp = false
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
                this.showWarp = false
            }
            this.showPlay = !this.showPlay
        },
        toggleWarp(){
            if(!this.showWarp) {
                this.showGive = false
                this.showGuildCreate = false
                this.showPlay = false
            }
            this.showWarp = !this.showWarp
        },
        setWarp() {
            console.log("this.toAo is ", this.toAo)
            this.$store.commit('setWarp', this.toAo)
            this.toggleWarp()
        },
        sendAllHodls() {
            let all = this.$store.tasks.filter(t => t.deck.indexOf(this.$store.member.memberId) > -1)
            all.forEach(t => {
                t.deck.length = 0
            })
            this.$store.dispatch('makeEvent', { type: 'ao-relay', address: this.$store.getters.warpDrive.address, ev: { type: 'task-received', tasks: all} })
        },
        testCreate() {
            let tasks = [Object.assign({}, this.b)]
            tasks[0].passed = [[this.$store.state.cash.address, this.toMemberWarp, this.$store.getters.member.memberId]]
            tasks[0].deck = []
            this.$store.dispatch('makeEvent', { type: 'ao-relay', address: this.$store.getters.warpDrive.address, ev: {
                type: 'tasks-received', tasks }
            })
        },
        migrate() {
            let found = []
            this.$store.dispatch('makeEvent', {
                type: 'doge-migrated',
                address: this.$store.getters.warpDrive.address,
                memberId: this.b.taskId,
                toMemberId: this.toMemberWarp,
            })
        },
        give() {
            let found = []
            if(this.$store.state.upgrades.sierpinski) {
                let crawler = [ this.b.taskId ]
                let newCards = []
                do {
                    newCards = []
                    crawler = _.filter(crawler, t => {
                        if(found.some(t2 => {
                            if(!t2 || !t2.taskId) return false
                            return t2.taskId === t
                        })) {
                            return false
                        }
                        let task = this.$store.getters.hashMap[t]
                        if(task === undefined || task.subTasks === undefined || task.priorities === undefined || task.completed === undefined) return false

                        found.push(calculations.safeClone(task))
                        newCards = newCards.concat(task.subTasks, task.priorities, task.completed)
                        return true
                    })
                    crawler = newCards
                } while(crawler.length > 0)
            } else {
                found = [ this.b ]
            }
            found[0].passed = [[this.$store.state.cash.address, this.toMemberWarp, this.$store.getters.member.memberId]]
            let next100 = found.splice(0, 20)
            while(next100.length > 0 || found.length > 0) {
                this.$store.dispatch('makeEvent', {
                    type: 'ao-relay',
                    address: this.$store.getters.warpDrive.address,
                    ev: {
                        type: 'tasks-received',
                        tasks: next100,
                    }
                })
                next100 = found.splice(0, 20)
            }
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
        relayInfoM(){
            return {
                type: "ao-relay",
                address: this.$store.getters.warpAddress,
                ev: {
                    type: "task-created",
                    name: this.b.name,
                    inId: this.toMemberWarp,
                    color: this.b.color,
                    deck: [],
                }
            }
        },
        relayInfoG(){
            return {
                type: "ao-relay",
                address: this.$store.getters.warpAddress,
                ev: {
                    type: "task-created",
                    name: this.b.name,
                    inId: this.toGuildWarp,
                    color: this.b.color,
                    deck: [],
                }
            }
        },
        phaseShift(delta = 1){
            let others = []
            let index = 0
            this.$store.state.tasks.forEach((t, i) => {
                if(t.subTasks.indexOf(this.b.taskId) !== -1) {
                    if(t.taskId === this.inId) {
                        index = i
                    }
                    others.push(t)
                }
            })
            others = others.slice(index).concat(others.slice(0, index))
            return others
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

.smallguild:hover, .smallguild.open
    background-image: url('../assets/images/badge_white.svg')

.smallguild.red
    background-image: url('../assets/images/badge_red.svg')
    opacity: 0.55

.smallguild.red:hover, .smallguild.red.open
    background-image: url('../assets/images/badge_white_red.svg')

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

.sierpinskiwrapper
    padding-top: 0.2em
    padding-left: 1em
</style>
