<template lang='pug'>

.memberrow.membershipcard
    .row.center
        img.logindicator(v-if='isLoggedIn', src='../../assets/images/loggedIn.svg')
        img.logindicator(v-else, src='../../assets/images/loggedOut.svg')
        label.hackername {{ m.name }}
    .bottomleft
        img.smallguild(src='../../assets/images/treasurechestnobkgrndwhiteD.png')
        label.stash {{ this.card.boost.toFixed(2) }}
    .bottomright
        .tooltip
            button.smallcaps.greenwx(v-if='m.active > 0', @click='deactivate') pause
            button.smallcaps.redwx(v-else, @click='activate') activate
            .tooltiptext
                .gui.title(v-if='nameList.length > 0') vouches
                ul(v-if='nameList.length > 0')
                    li
                        vouch.gui(v-for='n in nameList'  :memberId='n'  :b='b'  :inId='ugly')
    .clearboth
</template>

<script>

import DctrlActive from '../Members/DctrlActive'
import Badges from '../Members/Badges'
import Addr from '../Members/Addr'
import PreviewDeck from './PreviewDeck'
import Vouch from '../Members/Vouch'

export default {
    props: ['m'],
    components: {DctrlActive, Badges, Addr, PreviewDeck, Vouch},
    computed:{
        card(){
            return this.$store.getters.hashMap[this.m.memberId]
        },
        isLoggedIn(){
            let isLoggedIn
            this.$store.state.sessions.forEach( s => {
                if ( s.ownerId === this.m.memberId ){
                    isLoggedIn = true
                }
            })
            return isLoggedIn
        },
        nameList(){
            return this.$store.getters.contextCard.deck.map(mId => {
                return mId
            })
        },
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
@import '../../styles/tooltips'

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
    width: calc(100% - 0.5em)
    background: rgba(22, 22, 22, 0.2)
    text-align: center
    
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
    opacity: 0.3

.weekoldpaper
    background-image: url('../../assets/images/paper_aged_1.png')
    opacity: 0.3

.montholdpaper
    background-image: url('../../assets/images/paper_aged_2.png')
    opacity: 0.3

.threemontholdpaper
    background-image: url('../../assets/images/paper_aged_3.png')
    opacity: 0.3

.smallcaps
    color: #fff
    width: 100%
    border-radius: 50%
    opacity: 0.75
    padding: 0.5em
    border-style: solid
    border-color: white
    border-width: 2px

.smallguild
    height: 2em
    
.bottomleft, .bottomright
    width: fit-content
    position: relative
    bottom: 0
    
.bottomleft
    float: left
    left: 0
        
.bottomright
    right: 0
    float: right

.stash
    display: inline
    margin-left: 0.5em
    position: relative
    top: -0.35em

.clearboth
    clear: both
    
.gui
    font-size: 1.7em
    cursor: pointer

.title
    text-align: center
    font-size: 1.75em
    margin-top: 0.5em
</style>
