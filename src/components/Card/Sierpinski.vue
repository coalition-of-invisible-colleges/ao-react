<template lang='pug'>

.sierpinski(v-if='(b.subTasks.length + b.priorities.length + b.completed.length) >= 1'  ref='sierpinski')
    img.sierpinski.adjtooltip(v-if='$store.state.upgrades.sierpinski'  src='../../assets/images/sierpinski_activated.svg')
    img.sierpinski.adjtooltip(v-else  src='../../assets/images/sierpinski.svg')
    .tooltiptext(v-if='$store.getters.member.muted')
        p(v-if='!$store.state.upgrades.sierpinski') Sierpinski Drive Deactivated
        p(v-if='!$store.state.upgrades.sierpinski') Only this card will send (not the cards within).
        p(v-if='$store.state.upgrades.sierpinski') Sierpinski Jump Drive Activated
        p(v-if='$store.state.upgrades.sierpinski') Send this card and all cards within it (and the cards within those).
</template>

<script>

import SoundFX from '../../utils/sounds'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'

export default {
    props: ['b'],
    mounted() {
        console.log("this.refs is ", this.$refs)
        let el = this.$refs.sierpinski
        if(!el) return
        let mc = Propagating(new Hammer.Manager(el))

        let singleTap = new Hammer.Tap({ event: 'singletap', time: 400 })
        let doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, time: 400, interval: 400 })

        mc.add([singleTap, doubleTap])

        mc.on('singletap', (e) => {
            console.log("singletap")
            SoundFX.playTickMark()
            this.togglePrime()
            e.stopPropagation()
        })

        mc.on('doubletap', (e) => {
            e.stopPropagation()
        })
    },
    methods: {
        togglePrime() {
            this.$store.commit('toggleSierpinski')
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/tooltips'

.sierpinski
    height: 1.75em
    cursor: pointer
    position: relative
    top: 0.2em
    display: inline-block

.tooltiptext.goright
    left: 100%
</style>
