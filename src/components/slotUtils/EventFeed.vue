<template lang="pug">

transition(name='fade')
    .feed(v-if='eventstream.showEvent && eventstream.type!=="task-grabbed"')
        .bubble
        .float {{ eventstream.type }}
        .float {{ eventstream.meme }}
        img(src='../../assets/images/doge_faded.png')
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
        return {hodlphrases}
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
    //background: rgba(0, 0, 0, 0.4)
    color: white
    top: 25px
    left: 25px
    height: 10em
    width: 10em
    //border-radius: 50%
    z-index: 10000000

.feed img
    height: 10em
    width: 10em
    
img
    height: 170px

.fade-enter-active
    transition: opacity 5s ease-in
    transition: top 5s

.fade-leave-active
    transition: opacity 5s ease-out
    transition: top 5s

.fade-enter
    opacity: 0
    top: calc(100% + 10em)

.fade-leave-to /* .fade-leave-active below version 2.1.8 */
    opacity: 0
    top: calc(0% - 10em)

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
    float: left
    margin-left: 40%
    margin-top: 0
    color: white
    font-family: "Comic Sans MS"
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5)
    
.bubble
    background-image: -moz-radial-gradient(55px 55px 45deg, circle cover, rgba(100, 100, 100, 0.1) 15%, rgba(00, 00, 55, 0.5) 65%, rgba(00, 33, 00, 0.75) 90%)
    background-image: -webkit-radial-gradient(45px 45px, circle cover, rgba(100, 100, 100, 0.1) 15%, rgba(00, 00, 55, 0.5) 65%, rgba(00, 33, 00, 0.75) 90%)
    background-image: radial-gradient(45px 45px 45deg, circle cover, rgba(100, 100, 100, 0.1) 15%, rgba(00, 00, 55, 0.5) 65%, rgba(00, 33, 00, 0.75) 90%)

</style>
