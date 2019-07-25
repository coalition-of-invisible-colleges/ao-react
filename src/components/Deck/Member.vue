<template lang='pug'>

.memberrow.membershipcard.agedwrapper
    .agedbackground.freshpaper(v-if='cardAge < 8')
    .agedbackground.weekoldpaper(v-else-if='cardAge < 30')
    .agedbackground.montholdpaper(v-else-if='cardAge < 90')
    .agedbackground.threemontholdpaper(v-else='cardAge >= 90')
    .row
        .eleven.grid
            label.hackername {{ m.name }}
        .one.grid
            img.logindicator(v-if='isLoggedIn', src='../../assets/images/loggedIn.svg')
            img.logindicator(v-else, src='../../assets/images/loggedOut.svg')
    .row
        .nine.grid
            label {{ m.balance.toFixed(2) }}
        .three.grid
            dctrl-active(:m='m')
            button.smallcaps.greenwx(v-if='m.active > 0', @click='deactivate') pause
            button.smallcaps.redwx(v-else, @click='activate') activate

</template>

<script>

import DctrlActive from '../Members/DctrlActive'
import Badges from '../Members/Badges'
import Addr from '../Members/Addr'
import PreviewDeck from './PreviewDeck'

export default {
    props: ['m'],
    components: {DctrlActive, Badges, Addr, PreviewDeck},
    computed:{
        isLoggedIn(){
            let isLoggedIn
            this.$store.state.sessions.forEach( s => {
                if ( s.ownerId === this.m.memberId ){
                    isLoggedIn = true
                }
            })
            return isLoggedIn
        },
        cardInputSty(){
            return {
                redwx : this.b.color == 'red',
                bluewx : this.b.color == 'blue',
                greenwx : this.b.color == 'green',
                yellowwx : this.b.color == 'yellow',
                purplewx : this.b.color == 'purple',
                blackwx : this.b.color == 'black',
            }
        }
    },
    methods: {
        getName(taskId){
            let name
            this.$store.state.tasks.some(t => {
                if (taskId === t.taskId){
                    name = t.name
                    return true
                }
            })
            return name
        },
        deactivate() {
            this.$store.dispatch("makeEvent", {
                type: 'member-deactivated',
                memberId: this.$store.getters.member.memberId,
            })
        },
        activate() {
            this.$store.dispatch("makeEvent", {
                type: 'member-activated',
                memberId: this.$store.getters.member.memberId,
            })
        }

    }
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'

img
    height: 2em

label
    font-size: 1.246em
    font-weight: normal;
    margin: 1em
    display: block

.hackername
    font-family: monospace
    font-size: 1.5em

.membershipcard
    padding: 1em
    width: auto

.logindicator
    float: right

.logindicator:after
    clear: both

.agedwrapper
    position: relative

.agedbackground
    background-image: url('../../assets/images/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: absolute
    width: 100%
    height: 100%
    pointer-events: none
    //border-radius: 12px
    z-index: -1

.freshpaper
    background-image: url('../../assets/images/paper.jpg')
    opacity: 0.2

.weekoldpaper
    background-image: url('../../assets/images/paper_aged_1.png')
    opacity: 0.25

.montholdpaper
    background-image: url('../../assets/images/paper_aged_2.png')
    opacity: 0.3

.threemontholdpaper
    background-image: url('../../assets/images/paper_aged_3.png')
    opacity: 0.35
   
.smallcaps
    color: #fff
    width: 100%
    border-radius: 50%
    opacity: 0.75
    padding: 0.5em
    border-style: solid
    border-color: white
    border-width: 2px

</style>
