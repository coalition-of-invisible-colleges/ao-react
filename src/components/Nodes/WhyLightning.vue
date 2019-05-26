<template lang='pug'>

#whylightning
    .choosewhy#swipewhy
        button(@click='show(0)', :class='{ selected: whatWhy == "secure" }')
          transition(name='fade')
            span(v-if='whatWhy == "secure"') Lightning
            span(v-else)
                img(src='../../assets/images/secure.svg')
        button(@click='show(1)', :class='{ selected: whatWhy == "deck" }')
          transition(name='fade')
            span(v-if='whatWhy == "deck"') Deck
            span(v-else)
                img(src='../../assets/images/fast.svg')
        button(@click='show(2)', :class='{ selected: whatWhy == "card" }')
          transition(name='fade')
            span(v-if='whatWhy == "card"') Card
            span(v-else)
                img(src='../../assets/images/cheap.svg')
        button(@click='show(3)', :class='{ selected: whatWhy == "deckcard" }')
          transition(name='fade')
            span(v-if='whatWhy == "deckcard"') Deck = Card
            span(v-else)
                img(src='../../assets/images/private.svg')
        button(@click='show(4)', :class='{ selected: whatWhy == "sovereign" }')
          transition(name='fade')
            span(v-if='whatWhy == "sovereign"') Local
            span(v-else)
                img(src='../../assets/images/sovereign.svg')
    .why
      .row
        .eight.columns.whytext
            div(v-if='whatWhy == "secure"')
              p AO connects to clightning, a bitcoin lightning wallet on the device running it.
              p Above you can see the information about the wallet in satoshis; 100 million satoshis equals 1 Bitcoin.
              p The yellow bar shows funds controlled by the wallet on chain. Green and purple bars represent a lightning channel. Lightning channels divide the locked funds into local, belonging to this node, and remote controlled by the other node.
            div(v-if='whatWhy == "deck"')
              p On the deck you create new cards by clicking on the five color bar. Press enter or create card button to put the card on your deck.
              p The cards appear in five piles by color. On each pile you can swipe left and right or use the arrows to go through them, up and down to reorder. Activate the mendelorb to show all the cards in the pile.
              p Your deck has a priority list where you can quickly communicate what you are working on.
              p Find the sunken ship at the bottom of the deck to access your archive: all the cards you hodl.
            div(v-if='whatWhy == "card"')
              p Once a card has been created you can take actions at it's corners. Top left bird: send it to a member or guild. Top right boat: prioritize it. Bottom right vine: expand into it. Bottom left scroll: dismiss from current deck.
              p At the center bottom the dogein-pepeang coin indicates how many members have hold this card. Click to add or withdraw your support from the card, this also adds and removes from your archive. Holding a card keeps it safe.
            div(v-if='whatWhy == "deckcard"')
              p When you vine into a card it becomes a deck. You can create cards within the card, within the card, within the card, ...
              p When a card is expanded you have the ability to upgrade. Use the G-shield to turn the card into a local mission (guild) by adding a code name. Use the chest to add points to the card. Use the timecube to start a countdown.
            div(v-if='whatWhy == "sovereign"')
              p On the local page you can see the guilds with the most held rising to the top.
              p AO is meant to encourage positive activity and communication. Doge is love!
              p Insert successful hackerspace here.
            button(@click='next') {{whyList[whyIndex + 1]}}
        .four.columns
          transition(name='fade')
            img#wor(v-if='whatWhy == "deck"', src='../../assets/images/cate.png')
            img#wor(v-if='whatWhy == "card"', src='../../assets/images/mitchburger.png')
            img#wor(v-if='whatWhy == "deckcard"', src='../../assets/images/pyramid-all-seeing-eye-symbol-of-omniscience.png')
            img#wor(v-if='whatWhy == "sovereign"', src='../../assets/images/safu.jpg')

</template>

<script>

import Hammer from 'hammerjs'
import Tag from './Tag'

export default {
    mounted(){
      var el = document.getElementById('swipewhy')
      var mc = new Hammer.Manager(el)
      var Swipe = new Hammer.Swipe()
      mc.add(Swipe)

      mc.on('swipeleft', (e) => {
          console.log("swipeleft")
          if (this.whyIndex < 4){
              this.whyIndex ++
          }
      });

      mc.on('swiperight', (e) => {
          console.log("swiperight")
          if (this.whyIndex > 0){
              this.whyIndex --
          }
      });

    },
    data(){
        return {
            whyList: [
              "secure",
              "deck",
              "card",
              "deckcard",
              "sovereign",
            ],
            whyIndex: 0
        }
    },

    methods: {
        next(x){
            this.whyIndex ++
        },
        show(x){
            this.whyIndex = x
        },
    },
    computed: {
        whatWhy(){
            return this.whyList[this.whyIndex]
        },
        nodeUri(){

            return '032a438e14dde2082aefd287d52664d3ac99c395a99d5e6a87f38778515fad75f7@174.6.108.132:9735'
        },
    },
    components:{  Tag  },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/grid'
@import '../../styles/button'

.choosewhy
  width:100%
  button
    margin-top: 0
    margin-bottom: 0
    font-size: 1.77em
    width: (50/4)%
    background-color: accent5
    color: softYellow
    border-style: solid
    border-color: main
    border-width: thick;
    height: 3.33em
    transition: width 2s, height (2/3)s, background-color 2s
    overflow: hidden
    text-overflow: clip;
    white-space: nowrap;
    img
        height: 1em

button:hover
    background: accent1

button.selected
  height: 3.33em
  background: purple
  color: softYellow
  width: 50%
  transition: width 2s, height 2s, background-color 2s
  span
      transition: opacity 2s

.intro
    font-size: 1.7em
    background-color: blue
    text-align: left;
    float: left
    width: 100%
    border-radius: 1em
    color: softYellow

.why
    background: accent5
    color: softYellow
    float: left
    width: 100%
    padding-top: 2em
    padding-bottom: 2em
    span
        padding: 3em

#wor
    position: relative;
    right: 0
    height: 13em

.whytext
    font-size: 1.4em
    padding: 1.4em
    min-height: 29em


.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.small
    font-size: .68em
    word-break: break-all

</style>
