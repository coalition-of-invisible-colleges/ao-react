<template lang='pug'>

.actions
  .row.curs
    .four.grid(@click='toggleGive')
        img.btn(v-if='!showGive', src='../../assets/images/birdbtn.svg')
        img.btn(v-else, src='../../assets/images/birdbtnselected.svg')
    .four.grid(@click='togglePriori')
        img.btn(v-if='!showPriori', src='../../assets/images/boatbtn.svg')
        img.btn(v-else, src='../../assets/images/boatbtnselected.svg')
    .four.grid()
        router-link(:to='"/task/" + b.taskId', @click='toTop')
            img.btn(v-if='!isWithin', src='../../assets/images/vinebtn.svg')
            img.btn(v-else, src='../../assets/images/vinebtnselected.svg')
  .row
    .give(v-if='showGive')
        select(v-model='toMember')
            option(disabled, value='') to people
            option(v-for='n in $store.getters.activeMembers', :value="n.memberId") {{ n.name }}
        form-box(v-if='toMember' btntxt="give"  event='task-passed' v-bind:data='passInfo')
        select(v-model='toGuild')
            option(disabled, value='') to guild
            option(v-for='n in $store.getters.guilds', :value="n.taskId") {{ n.guild }}
        form-box(v-if='toGuild' btntxt="play"  event='task-sub-tasked' v-bind:data='playInfo')
    .priori(v-if='showPriori')
        form-box(v-if='showAccept' btntxt="Prioritize"  event='task-prioritized' v-bind:data='infoPriority')
        form-box(v-if='showGrab' btntxt="grab"  event='task-grabbed' v-bind:data='info')
        form-box(v-if='showDrop' btntxt="drop"  event='task-dropped' v-bind:data='info')
        form-box(v-if='inId' btntxt="dismiss"  event='task-de-sub-tasked' v-bind:data='deSubInfo')
        form-box(v-if='showPurge', btntxt="purge"  event='task-removed' v-bind:data='info')
</template>

<script>

import calculations from '../../calculations'
import Current from '../Resources/Current'
import FormBox from '../slotUtils/FormBox'
import PreviewDeck from '../Deck/PreviewDeck'

export default {
    props: ['b', 'inId'],
    data() {
        return {
            showPriori: false,
            showGive: false,
            toMember: '',
            toGuild: '',
        }
    },
    components: { Current, FormBox, PreviewDeck },
    methods: {
        toggleGive(){
            this.showPriori = false
            this.showGive = !this.showGive
        },
        togglePriori(){
            this.showGive = false
            this.showPriori = !this.showPriori
        },
        toTop(){
            window.scrollTo(0, 0);
        },
    },
    computed: {
      showPurge(){
          return this.b.deck.length === 0
      },
      isWithin(){
          return this.b.taskId === this.$router.currentRoute.path.split('/')[2]
      },
      claimInfo(){
          return {
              taskId: this.b.taskId,
              memberId: this.$store.getters.member.memberId,
              notes: '',
          }
      },
      deSubInfo(){
          return {
              taskId: this.inId,
              subTask: this.b.taskId,
          }
      },
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
      showDrop(){
          return this.b.deck.indexOf( this.info.memberId ) !== -1
      },
      showGrab(){
          return this.b.deck.indexOf( this.info.memberId ) === -1
      },
      showAccept(){
          return true
      },
      info(){
          return {
              memberId: this.$store.getters.member.memberId,
              taskId: this.b.taskId,
          }
      },
      cardInputSty(){
          return {
              activated: this.active,
              redwx : this.b.color == 'red',
              bluewx : this.b.color == 'blue',
              greenwx : this.b.color == 'green',
              yellowwx : this.b.color == 'yellow',
              purplewx : this.b.color == 'purple',
              blackwx : this.b.color == 'black',
          }
      },
      infoPriority(){
        return {
              inId: this.inId,
              taskId: this.b.taskId,
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

.row
    width: 100%
    .mainColumn
      width:calc(100% - 75px - 4%)
    .secondaryColumn
      width:75px
      button
        height:75px

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

</style>
