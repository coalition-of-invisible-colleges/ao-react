<template lang='pug'>

.bird
    div(ref='bird')
        div.birdy.faded.smallguild(v-if='!showGive && b.guild || showGive && b.guild'  :class='{ open : showGive }')
        img.birdy.faded(v-else-if='!showGive && !b.guild' src='../../assets/images/birdbtn.svg')
        img.birdy(v-else, src='../../assets/images/birdbtnselected.svg')
    .give(v-if='showGive')
        select(v-model='toAo')
            option(@click='setWarp(-1)') here
            option(v-for='(a, i) in $store.state.ao'  :key='a.address'  :value='a.address'  @click='setWarp(i)') {{ a.alias ? a.alias : a.address.slice(0,9) }}
        div(v-if='$store.getters.warpDrive')
            img.birdy(src='../../assets/images/navigas/sunUni.svg')
            select(v-model='toMemberWarp')
                option(disabled, value='') to people
                option(v-for='n in $store.getters.warpMembers', :value="n.memberId") {{ n.name }}
            form-box(v-if='toMemberWarp' btntxt="give"  event='task-passed' v-bind:data='relayInfoM'  @click='makeSound')
            select(v-model='toGuildWarp')
                option(disabled, value='') to guild
                option(v-for='n in $store.getters.warpGuilds', :value="n.taskId") {{ n.guild }}
            form-box(v-if='toGuildWarp' btntxt="play"  event='task-sub-tasked' v-bind:data='relayInfoG'  @click='makeSound')
        div(v-else)
            select(v-model='toMember')
                option(disabled, value='') to people
                option(v-for='n in $store.state.members', :value="n.memberId") {{ n.name }}
            form-box(v-if='toMember' btntxt="give"  event='task-passed' v-bind:data='passInfo'  @click='makeSound')
            select(v-model='toGuild')
                option(disabled, value='') to guild
                option(v-for='n in $store.getters.guilds', :value="n.taskId") {{ n.guild }}
            form-box(v-if='toGuild' btntxt="play"  event='task-sub-tasked' v-bind:data='playInfo'  @click='makeSound')
    guild-create.theTitle(:editing='showGuildCreate'  :b='b'  @closeit='toggleGuildCreate')
</template>

<script>

import FormBox from '../slotUtils/FormBox'
import GuildCreate from '../forms/GuildCreate'
import SoundFX from '../../modules/sounds'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'

export default {
    props: ['b', 'inId'],
    components: {
        FormBox, GuildCreate
    },
    data() {
        return {
            toMemberWarp: '',
            toGuildWarp: '',
            showGive: false,
            showGuildCreate: false,
            toMember: '',
            toGuild: '',
            toAo:'',
        }
    },
    mounted() {
        let el = this.$refs.bird
        if(!el) return
        let mc = Propagating(new Hammer.Manager(el))

        let Tap = new Hammer.Tap({ time: 400 })
        mc.add(Tap)
        mc.on('tap', (e) => {
            console.log("bird tap")
            this.toggleGive()
            e.stopPropagation()
        })

        let Press = new Hammer.Press({ time: 400 })
        mc.add(Press)
        mc.on('press', (e) => {
            console.log("bird press")
            this.toggleGuildCreate()
            e.stopPropagation()
        })

        console.log("refs is", this.$refs)
    },
    methods: {
        toggleGive(){
            if(this.showGuildCreate) {
                this.toggleGuildCreate()
                return
            }
            SoundFX.playTickMark()
            if(!this.showGive) {
                this.showGuildCreate = false
            }
            this.showGive = !this.showGive
        },
        toggleGuildCreate(){
            SoundFX.playTickMark()
            if(!this.showGuildCreate) {
                this.showGive = false
            }
            this.showGuildCreate = !this.showGuildCreate
            if(this.showGuildCreate) {
                setTimeout(()=>{ document.getElementById('titlebox').focus() }, 1)
            }
        },
        setWarp(i){
            console.log('setwarp' , i)
            this.$store.commit('setWarp', i)
        },
        makeSound(){
            console.log("makeSound")
            SoundFX.playBirdFlap()
        }
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
        }
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours';
@import '../../styles/skeleton';
@import '../../styles/grid';
@import '../../styles/button';

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

select.form-control
    color: black

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

.give
    position: relative
    top: 1em
    margin-bottom: 1em    

.theTitle
    position: absolute
    left: 3.3em
    top: 1.3em
</style>
