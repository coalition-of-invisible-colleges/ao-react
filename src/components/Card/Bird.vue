<template lang='pug'>

.bird(ref='wholeBird')
    div(ref='bird')
        div.birdy.faded.smallguild(v-if='!showGive && b.guild || showGive && b.guild'  :class='{ open : showGive }')
        img.birdy.faded(v-else-if='!showGive && !b.guild' src='../../assets/images/birdbtn.svg')
        img.birdy(v-else, src='../../assets/images/birdbtnselected.svg')
    .play(v-if='showPlay')
        div(v-if='$store.state.upgrades.warp > -1')
            select.shorten(v-model='toGuildWarp')
                option(disabled, value='') to mission
                option(v-for='n in $store.getters.warpDrive.state.members', :value="n.memberId") {{ n.name }}
            form-box.small(v-if='toGuildWarp' btntxt="give"  event='task-passed' v-bind:data='relayInfoM'  @click='makeSound')
            span.sierpinskiwrapper
                sierpinski(:b='b')
            .serverLabel on {{ $store.getters.warpDrive.address }}
            .serverLabel on {{ $store.getters.warpDrive.alias }}
        select(v-else  v-model='toGuild')
            option(disabled, value='') to mission
            template(v-for='g in $store.getters.sendableGuilds'  :key='$store.getters.sendableGuilds')
                option(:value="g.taskId") {{ g.guild }}
                template(v-for='p in g.guilds')
                    option(:value="p.taskId") &nbsp;&nbsp;&nbsp;&nbsp;{{ p.guild }}
                    template(v-for='sp in p.guilds')
                        option(:value="sp.taskId") &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ sp.guild }}
        form-box.small(btntxt="give"  event='task-passed' v-bind:data='playInfo'  @click='makeSound')
    .give(v-if='showGive')
        div(v-if='$store.state.upgrades.warp > -1')
            select.shorten(v-model='toMemberWarp'  :key='$store.getters.warpDrive.address')
                option(disabled, value='') to people
                option(v-for='n in $store.getters.warpDrive.state.members', :value="n.memberId") {{ n.name }}
            button.small(@click='give') send
            span.sierpinskiwrapper
                sierpinski(:b='b')
            .serverLabel on {{ $store.getters.warpDrive.address }}
        div(v-else)
            select(v-model='toMember')
                option(disabled, value='') to people
                option(v-for='n in $store.state.members', :value="n.memberId") {{ n.name }}
            form-box.small(btntxt="give"  event='task-passed' v-bind:data='passInfo'  @click='makeSound')
    .warp(v-if='showWarp')
        select(v-model='toAo')
            option(disabled  value='') to AO
            option(v-for='(n, i) in $store.state.ao', :value='i') {{ n.alias }}
        button.small(@click='setWarp') set
    .migrate(v-if='showMigrate')
        select(v-model='toAo')
            option(disabled  value='') to AO
            option(v-for='(n, i) in $store.state.ao', :value='i') {{ n.address }}
        button.small(@click='setWarp') send all cards
    guild-create.theTitle(:editing='showGuildCreate'  :b='b'  @closeit='toggleGuildCreate')
</template>

<script>

import FormBox from '../slotUtils/FormBox'
import GuildCreate from '../forms/GuildCreate'
import SoundFX from '../../utils/sounds'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
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
            showMigrate: false,
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
            if(this.b.taskId === this.$store.getters.member.memberId) {
                SoundFX.playTickMark()
                this.toggleMigrate()
                e.stopPropagation()
                return
            }
            SoundFX.playTickMark()
            this.toggleGive()
            e.stopPropagation()
        })

        mc.on('doubletap', (e) => {
            if(this.b.taskId === this.$store.getters.member.memberId) return
            SoundFX.playTickMark()
            this.togglePlay()
            e.stopPropagation()
        })

        mc.on('tripletap', (e) => {
            if(this.b.taskId === this.$store.getters.member.memberId) return
            SoundFX.playTickMark()
            // this.toggleWarp()
            this.toggleWarp()
            e.stopPropagation()
        })

        mc.on('press', (e) => {
            if(this.b.taskId === this.$store.getters.member.memberId) return
            SoundFX.playTickMark()
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

        console.log("this.refs is ", this.$refs)
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
        toggleMigrate() {
            this.showMigrate = !this.showMigrate
        },
        setWarp() {
            console.log("this.toAo is ", this.toAo)
            this.$store.commit('setWarp', this.toAo)
        },
        makeSound() {
            SoundFX.playBirdFlap()
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
            console.log("trying to send tasks: " , tasks)
            this.$store.dispatch('makeEvent', { type: 'ao-relay', address: this.$store.getters.warpDrive.address, ev: {
                type: 'tasks-received', tasks }
            })
        },
        give() {
            this.makeSound()
            let found = []
            if(this.$store.state.upgrades.sierpinski) {
                let crawler = [ this.b.taskId ]
                let newCards = []
                do {
                    newCards = []
                    crawler = _.filter(crawler, t => {
                        if(found.some(t2 => { return t2.taskId === t })) return false
                        let task = this.$store.getters.hashMap[t]
                        if(task === undefined || task.subTasks === undefined || task.priorities === undefined || task.completed === undefined) return false

                        // type check all this
                        let safeClone = {
                            taskId: task.taskId,
                            name: task.name,
                            claimed: [],
                            completed: task.completed,
                            passed: [],
                            guild: task.guild,
                            subTasks: task.subTasks,
                            lastClaimed: 0,
                            book: task.book,
                            priorities: task.priorities,
                            deck: [],
                            color: task.color,
                            address: task.address,
                            allocations: [],
                            bolt11: task.bolt11,
                            payment_hash: '',
                            boost: 0,
                        }
                        console.log("safeClone is ", safeClone)
                        found.push(safeClone)
                        newCards = newCards.concat(task.subTasks, task.priorities, task.completed)
                        return true
                    })
                    crawler = newCards
                } while(crawler.length > 0)
            } else {
                found = [ this.b ]
            }
            found[0].passed = [[this.$store.state.cash.address, this.toMemberWarp, this.$store.getters.member.memberId]]
            console.log("found is ", found)
            this.$store.dispatch('makeEvent', {
                type: 'ao-relay',
                address: this.$store.getters.warpDrive.address,
                ev: {
                    type: 'tasks-received',
                    tasks: found,
                }
            })
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
            console.log("others is ", others)
            others = others.slice(index).concat(others.slice(0, index))
            return others
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/button'
@import '../../styles/tooltips'

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
    background-image: url('../../assets/images/badge.svg')
    background-repeat: no-repeat
    background-size: contain
    background-position: top left
    height: 1.67em
    width: 1.7em
    opacity: 1
    position: relative
    z-index: 10

.smallguild:hover, .smallguild.open
    background-image: url('../../assets/images/badge_white.svg')

.give, .play, .warp, .migrate
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
