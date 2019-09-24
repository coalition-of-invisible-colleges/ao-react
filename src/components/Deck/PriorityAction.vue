<template lang='pug'>

.priorityaction.clearboth

</template>

<script>

import HyperCard from '../Card'
import Linky from '../Card/Linky'

export default {
    components: { HyperCard, Linky },
    data(){
        return {
            notes: ''
        }
    },
    props: ['taskId', 'inId'],
    computed: {
        card(){
            return this.$store.getters.hashMap[this.taskId]
        },
        name(){
            return this.card.name
        },
        cardInputSty() {
          let color = this.card.color
          return {
              redwx : color == 'red',
              bluewx : color == 'blue',
              greenwx : color == 'green',
              yellowwx : color == 'yellow',
              purplewx : color == 'purple',
              blackwx : color == 'black',
          }
        },
        isGrabbed(){
          return this.card.deck.indexOf( this.$store.getters.member.memberId ) > -1
        },
        isDecked(){
          return this.$store.getters.memberCard.subTasks.indexOf(this.taskId) > -1
        },
    },
    methods: {
        deaction(){
            this.$store.commit("setAction", false)
        },
        goIn(){
            this.playPageTurn()
            this.$router.push("/task/" + this.taskId)
        },
        playPageTurn(){
            var flip = new Audio(require('../../assets/sounds/myst158.wav'))
            flip.volume = flip.volume * 0.3
            flip.play()
        },
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/grid'

button
    width: 100%
    span
        color : white
        font-weight: bolder;

.priorityaction
    color: white

.clearboth
    clear: both

.arrow
    height: 3.35em
    border-radius: 3px

button
    img
        background: white
        padding: .1em

.fr
  float:right

.fl
  float:left

.agedwrapper
    position: relative
    margin-top: 0.5em
    float: right
    padding: 0.5em
    width: calc(100% - 5.5em)
    margin-right: 0.5em

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

.freshpaper
    background-image: url('../../assets/images/paper.jpg')
    opacity: 0.2

.emphasize
    font-weight: bold
    font-size: 1.5em
</style>
