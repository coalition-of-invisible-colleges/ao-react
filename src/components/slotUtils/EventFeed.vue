<template lang="pug">

transition(name='fade' v-for='(e, i) in eventstream')
    .feed.wiggle(v-if='e.showEvent'  v-bind:style="{ left: e.randomX }")
        img.doge(src='../../assets/images/doge_faded.png')
        //- <input v-model.number="randomWiggle">
        img.bubble(src='../../assets/images/bubble.png')
        .float(:style='{ color: e.randomColors[0], left: e.randomXs[0], top: e.randomYs[0] }') {{ e.type.replace('-', ' ') }}
        .float(:style='{ color: e.randomColors[1], left: e.randomXs[1], top: e.randomYs[1] }') {{ e.meme }}
        .float(v-if='e.type==="task-created"') {{ e.name }}

</template>

<script>

export default {
    data() {
        let hodlphrases = ["hodled",
                        "much hodl",
                        "this card is safe",
                        "hodled forever",
                        "such hodling",
                        "hodl",
                        "hodling",
                        "wow",
                        "hodled",
                        "hodled",
                        "hodled",
                        "hodled",
                        "hodl",
                        "hodl",
                        "wow such hodl",
                        "in ur holochains",
                        "hodl"]
        return { hodlphrases, }
    },
    computed:{
        eventstream(){
            return this.$store.state.eventstream
        },
    },
}
</script>

<style lang='stylus' scoped>
@import '../../styles/grid'
@import '../../styles/breakpoints'
@import '../../styles/colours'

h4
    margin-bottom: -10px
    padding:.3em
    background: accent1

h5
    background: black
    padding:.4em


label
    font-size: 1.3em

.feed
    position: fixed
    color: white
    top: -11em
    left: 45%
    height: 10em
    width: 10em
    z-index: 10000000

.feed img
    height: 10em
    width: 10em
    
img
    height: 170px
    position: absolute
    top: 0
    left: 0

.fade-enter-active
    transition: top 7s

.fade-leave-active
    transition: top 7s
    top: -30em

.fade-enter
    top: calc(100% + 10em)

.fade-leave-to /* .fade-leave-active below version 2.1.8 */
    top: -30em

@keyframes wiggle {
    0%, 100% { transform: translate(-16px, 0) }
    25% { transform: translate(-8px, 0) }
    50% { transform: translate(16px, 0) }
    75% { transform: translate(8px, 0) }
}

.wiggle {
  animation: wiggle 1s infinite
  transition-timing-function: ease
}

.tooltip
    position: fixed
    background: rgba(0, 0, 0, 0.5)
    color: white
    left: 50%
    top: 50%
    padding: 0.5em 1em
    text-align: center
    z-index: 10000000

.float
    position: relative
    left: 30%
    top: 80%
    color: white
    font-family: "Comic Sans MS"
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5)
    
.doge
    opacity: 0.8
    
.bubble
    opacity: 0.5
</style>
