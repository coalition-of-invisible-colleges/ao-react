<template lang='pug'>

.bird(@click.stop  @dblclick.prevent)
    div(@click.stop='toggleGive')
        div.birdy.faded.smallguild(v-if='!showGive && b.guild || showGive && b.guild'  :class='{ open : showGive }')
        img.birdy.faded(v-else-if='!showGive && !b.guild' src='../../assets/images/birdbtn.svg')
        img.birdy(v-else, src='../../assets/images/birdbtnselected.svg')
    .give(v-if='showGive')
        select(v-model='toAo'  @change)
            option(@click='setWarp(-1)') here
            option(v-for='(a, i) in $store.state.ao'  :key='a.address'  :value='a.address'  @click='setWarp(i)') {{ a.alias ? a.alias : a.address.slice(0,9) }}
        div(v-if='$store.getters.warpDrive')
          img.birdy(src='../../assets/images/navigas/sunUni.svg')
          select(v-model='toMemberWarp')
              option(disabled, value='') to people
              option(v-for='n in $store.getters.warpMembers', :value="n.memberId") {{ n.name }}
          form-box(v-if='toMemberWarp' btntxt="give"  event='task-passed' v-bind:data='relayInfoM')
          select(v-model='toGuildWarp')
              option(disabled, value='') to guild
              option(v-for='n in $store.getters.warpGuilds', :value="n.taskId") {{ n.guild }}
          form-box(v-if='toGuildWarp' btntxt="play"  event='task-sub-tasked' v-bind:data='relayInfoG')
        div(v-else)
          select(v-model='toMember')
              option(disabled, value='') to people
              option(v-for='n in $store.state.members', :value="n.memberId") {{ n.name }}
          form-box(v-if='toMember' btntxt="give"  event='task-passed' v-bind:data='passInfo')
          select(v-model='toGuild')
              option(disabled, value='') to guild
              option(v-for='n in $store.getters.guilds', :value="n.taskId") {{ n.guild }}
          form-box(v-if='toGuild' btntxt="play"  event='task-sub-tasked' v-bind:data='playInfo')
          div(v-if='$store.getters.contextCard.taskId === b.taskId')
              guild-create
</template>

<script>

import FormBox from '../slotUtils/FormBox'
import GuildCreate from '../forms/GuildCreate'
import Flickity from 'vue-flickity'

export default {
    props: ['b', 'inId'],
    components: {
        FormBox, Flickity
    },
    data() {
        return {
            toMemberWarp: '',
            toGuildWarp: '',
            showGive: false,
            toMember: '',
            toGuild: '',
            toAo:'',
        }
    },
    components: { FormBox, GuildCreate },
    methods: {
        toggleGive(){
            this.showGive = !this.showGive
        },
        setWarp(i){
            console.log('setwarp' , i)
            this.$store.commit('setWarp', i)
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
    width: max-content
    margin-bottom: 1em

</style>
