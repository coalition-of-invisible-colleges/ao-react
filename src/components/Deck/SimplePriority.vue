<template lang='pug'>

.p.clearboth(@dblclick='goIn')
  .row
    .shipcontainer
      img.singleship(src='../../assets/images/singleship.svg')
      div.agedwrapper(:class="cardInputSty")
          linky(:x='card.name'  :key='name')
</template>

<script>

import Linky from '../Card/Linky'
import Hypercard from '../Card/index'

export default {
    props: ['taskId', 'inId', 'c'],
    components: { Hypercard, Linky },
    methods: {
        goIn(){
            let panel = this.c
            if (panel && panel.length && panel.length > 0){

            } else {
                panel = [this.taskId]
            }

            let top = panel.indexOf(this.taskId)

            if (top > -1){

            } else {
                top = 0
            }

            this.$store.dispatch("goIn", {
                inId: this.inId,
                top,
                panel
            })

            this.$router.push('/task/' + this.taskId)
        },
    },
    computed: {
        card(){
            return this.$store.getters.hashMap[this.taskId]
        },
        cardInputSty() {
          return {
              redwx : this.card.color == 'red',
              bluewx : this.card.color == 'blue',
              greenwx : this.card.color == 'green',
              yellowwx : this.card.color == 'yellow',
              purplewx : this.card.color == 'purple',
              blackwx : this.card.color == 'black',
          }
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

.p
    color: white

.clearboth
    clear: both

.singleship
    width: 3.3724em
    position: absolute
    margin-top: 1em
    float: right

.agedwrapper
    position: relative
    margin-top: 0.5em
    width: calc(100% - 5.5em)
    float: right
    padding: 0.5em
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
    padding: 1em

.allocated
    position: absolute
    padding-left: 0.25em
    width: 2em
    text-align: center
    font-size: 0.95em
    margin-top: 0.5em
    color: white
    text-shadow: 2px 2px 2px rgba(0.05, 0.05, 0.05, 0.5)
    font-size: 1.5em
    pointer-events: none

</style>
