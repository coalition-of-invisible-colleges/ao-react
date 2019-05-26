<template lang="pug">

transition(name='fade')
    .feed(v-if='eventstream.showEvent && eventstream.type!=="task-grabbed"')
      .row
        .six.grid
            img(src='../../assets/images/doge.png')
        .six.grid
            h5 {{ eventstream.type }}
            h4 {{ eventstream.meme }}
    .tooltip(v-if='eventstream.showEvent && eventstream.type==="task-grabbed"')
        p {{ hodlphrases[Math.floor(Math.random() * hodlphrases.length)] }}

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
        return {hodlphrases,}
    },
    computed:{
        eventstream(){
            return this.$store.state.eventstream
        }
    }
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
    background: accent2
    color: white
    top: 25px
    left: 25px
    height:160px
    width: 500px

img
    height:170px

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}

.tooltip
    position: fixed
    background: rgba(0, 0, 0, 0.5)
    color: white
    left: 50%
    top: 50%
    padding: 0.5em 1em
    text-align: center

</style>
