<template lang='pug'>

.bird
    div(@click='toggleGive')
        img.birdy.faded(v-if='!showGive', src='../../assets/images/birdbtn.svg')
        img.birdy(v-else, src='../../assets/images/birdbtnselected.svg')
    .give(v-if='showGive')
        select(v-model='toMember')
            option(disabled, value='') to people
            option(v-for='n in $store.getters.activeMembers', :value="n.memberId") {{ n.name }}
        form-box(v-if='toMember' btntxt="give"  event='task-passed' v-bind:data='passInfo')
        select(v-model='toGuild')
            option(disabled, value='') to guild
            option(v-for='n in $store.getters.guilds', :value="n.taskId") {{ n.guild }}
        form-box(v-if='toGuild' btntxt="play"  event='task-sub-tasked' v-bind:data='playInfo')
</template>

<script>

import FormBox from '../slotUtils/FormBox'

export default {
    props: ['b', 'inId'],
    components: {
        FormBox
    },
    data() {
        return {
            showGive: false,
            toMember: '',
            toGuild: '',
        }
    },
    components: { FormBox },
    methods: {
        toggleGive(){
            this.showGive = !this.showGive
        },
    },
    computed: {
        playInfo(){
            return {
                taskId:  this.toGuild,
                subTask: this.b.taskId,
            }
        },
        passInfo(){
            return {
                taskId: this.b.taskId,
                fromMemberId: this.$store.getters.member.memberId,
                toMemberId: this.toMember,
            }
        },
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
    
</style>
