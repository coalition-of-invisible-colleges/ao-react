<template lang='pug'>

.memberrow.membershipcard
    bird(v-if='$store.state.upgrades.warp >= 0'  :b='card')
    .row.center.clearboth(:class='{ pullup : $store.state.upgrades.mode !== "boat" && $store.state.upgrades.mode !== "doge" && dukkha >= 1 }')
        img.logindicator(v-if='isLoggedIn', src='../assets/images/loggedIn.svg')
        img.logindicator(v-else, src='../assets/images/loggedOut.svg')
        label.hackername(:class='{ spacer: $store.state.upgrades.mode !== "doge" || $store.getters.contextCard.priorities.length < 1 }') {{ m.name }}
    .bottomleft(@click='goChest')
        img.smallguild(src='../assets/images/chest.svg')
        label.stash(v-if='card.boost') {{ card.boost.toFixed(2) }}
        label.stash(v-else) 0
    not-zen(v-if='$store.state.upgrades.mode !== "boat" && dukkha >= 1')
    .bottomright
      .tooltip
        img.dogecoin.adjtooltip(src='../assets/images/doge_in_circle.png'  :class='{ faded : m.active <= 0 }'  @click='toggleActivated')
        .tooltiptext.membertooltip
            p.suggest(v-if='m.active > 0 && m.memberId === $store.getters.member.memberId') click to deactivate
            p.suggest(v-if='m.active <= 0 && m.memberId === $store.getters.member.memberId') click to activate
            .gui.title(v-if='nameList.length > 0') vouches
            ul.left(v-if='nameList.length > 0')
                li(v-for='n in nameList')
                    vouch.gui(:memberId='n'  :b='b'  :inId='ugly')
            h2 {{ deckSize }} cards
            .gui(v-if='m.active > 0') account is active
            .gui(v-else) account is inactive cannot use resources, will not be included in rent.
    .clearboth
</template>

<script>

import PreviewDeck from './PreviewDeck'
import Vouch from './Vouch'
import Bird from './Bird'
import NotZen from './NotZen'
import GiftBox from './GiftBox'

export default {
    props: ['m'],
    components: {PreviewDeck, Vouch, Bird, NotZen, GiftBox},
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
        dukkha() {
            return this.$store.getters.contextCard.priorities.length
        },
        deckSize() {
            return this.$store.state.tasks.filter(t => {
                return t.deck.indexOf(this.m.memberId) >= 0
            }).length
        },
    },
    methods: {
        goChest(){
            this.$router.push('/chest')
        },
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
        toggleActivated() {
            if(this.m.memberId !== this.$store.getters.member.memberId) {
                return
            }
            if(this.$store.getters.member.active > 0) {
                this.deactivate()
            } else {
                this.activate()
            }
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

@import '../styles/colours'
@import '../styles/tooltips'

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

.spacer
    margin-bottom: 3em

.membershipcard
    padding: 1em
    background: rgba(22, 22, 22, 0.2)
    text-align: center
    position: relative

.agedwrapper
    position: relative

.agedbackground
    background-image: url('../assets/images/paper.jpg')
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
    background-image: url('../assets/images/paper.jpg')
    opacity: 0.3

.weekoldpaper
    background-image: url('../assets/images/paper_aged_1.png')
    opacity: 0.3

.montholdpaper
    background-image: url('../assets/images/paper_aged_2.png')
    opacity: 0.3

.threemontholdpaper
    background-image: url('../assets/images/paper_aged_3.png')
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

.bottomleft
    float: left
    width: fit-content
    position: relative
    bottom: 0
    left: 0
    cursor: pointer

.bottomright
    width: fit-content
    right: 1em
    bottom: 0.65em
    float: right
    margin-top: -3em

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
    font-size: 1.8em
    margin-top: 0.5em
    font-weight: bold

.help
    font-size: 1.3em

.suggest
    font-style: italic
    font-size: 1.3em

.dogecoin
    width: 3em
    height: 3em
    cursor: pointer

.faded
    opacity: 0.39

.tooltiptext.membertooltip
    width: 20em
    z-index: 151
    left: 6.5em
    top: -10.1em
    font-size: 0.7em

ul.left
    text-align: left

.clearboth
    clear: both

.pullup
    margin-bottom: -2em
</style>
