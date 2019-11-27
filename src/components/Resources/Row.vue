<template lang='pug'>

.memberrow.membershipcard(@dblclick='goIn')
    .row.center
        label.hackername {{ r.name }}
            span
                img.smallguild(src='../../assets/images/treasurechestnobkgrndwhiteD.png')
                label.stash(v-if='card.boost') {{ card.boost.toFixed(2) }}
                label.stash(v-else) 0
        button(@click='use("A")') A
        button(@click='use("B")') B
        button(@click='use("C")') C
        button(@click='use("D")') D
        button(@click='use("E")') E
        button(@click='use("F")') F
        button(@click='resourcePurged')
    .bottomleft(v-if='card.boost')
    .bottomright
    .clearboth
</template>

<script>

import Addr from '../Members/Addr'
import PreviewDeck from '../Deck/PreviewDeck'
import Vouch from '../Members/Vouch'
import SoundFX from '../../utils/sounds'

export default {
    props: ['r', 'c'],
    components: { Addr, PreviewDeck, Vouch},
    computed:{
        card(){
            return this.$store.getters.hashMap[this.r.resourceId]
        },
    },
    methods: {
        resourcePurged(){
            let newEv = {
                type: 'resource-purged',
                resourceId: this.r.resourceId,
            }
            console.log('kill triggered:', newEv)
            this.$store.dispatch("makeEvent", newEv)
        },
        use(letter){
            let newEv = {
                type: 'resource-used',
                resourceId: this.r.resourceId,
                memberId: this.$store.getters.member.memberId,
                amount: 1,
                charged:this.r.charged,
                notes:letter,
            }
            console.log('use triggered:', newEv)
            this.$store.dispatch("makeEvent", newEv)
        },
        goIn(){
            SoundFX.playPageTurn()
            let top = this.c.indexOf(this.r.resourceId)
            console.log("goIn called with TOP: ", top)
            if (top > -1){
                this.$store.dispatch("goIn", {
                    parents: [],
                    panel: this.c,
                    top,
                })
                this.$router.push('/' + this.$store.state.upgrades.mode)
            }
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

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/tooltips'
@import '../../styles/button'

button
    width: 4em
    height:2em
    margin: 1.1em
    font-size: 1.5em

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
    left: 7em
    top: -11em

ul.left
    text-align: left
</style>
