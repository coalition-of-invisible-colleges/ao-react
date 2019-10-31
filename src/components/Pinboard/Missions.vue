<template lang='pug'>
#wrex
      //- div(v-if='$store.state.upgrades.warp > -1')
      //-     h1.up {{ $store.getters.warpDrive.alias }} Top Missions
      //-     card-panel.gutter(:c='$store.getters.warpGuilds')
      //-     h6.centered {{ $store.getters.warpAddress }}
      //- div(v-else)
      //- h1.up {{ $store.state.cash.alias }} Top Missions
      //- flickity(:options='flickityOptions'  ref='guildsBar'  v-model='guildsBar')
      //-     .transparentsides
      //-     .carousel-cell.agedwrapper(v-for='(t, i) in guilds'  :key='t.taskId'  :class='cardInputSty(t.color)'  @click='selectGuild(i)')
      //-         .guildname(:class='{ selectedguild : showGuild === i }') {{ t.guild }}
      //-         .agedbackground.freshpaper(v-if='cardAge(t) < 8')
      //-         .agedbackground.weekoldpaper(v-else-if='cardAge(t) < 30')
      //-         .agedbackground.montholdpaper(v-else-if='cardAge(t) < 90')
      //-         .agedbackground.threemontholdpaper(v-else='cardAge(t) >= 90')
      //- hypercard.gutter(v-if='guilds[showGuild] && $store.state.upgrades.mode == "boat"'  :b='guilds[showGuild]'  :key='resetKey'  :c='pubGuildIds')
      h1 ao peer nodes coming soon
      flickity(v-if='$store.state.ao.length > 0'  :options='flickityOptions')
          .carousel-cell.greenwx(@click='setWarp(-1)'  ref='warp')
              span(:class='{redTx: -1 === $store.state.upgrades.warp}') here
          .carousel-cell.greenwx(v-for='(a, i) in $store.state.ao'  @click='setWarp(i)')
              span(:class='{redTx: i === $store.state.upgrades.warp}')  {{ a.alias ? a.alias : a.address.slice(0,11) }}
</template>

<script>
import Flickity from 'vue-flickity'
import CardPanel from '../Deck/CardPanel'
import Hypercard from "../Card"

export default {
  components:{
      Flickity,
      CardPanel,
      Hypercard,
  },
  data(){
      let guilds = []
      let uniqueG = []

      // XXX this calc is tooooooo slooooooow
      this.$store.state.tasks.forEach((c, i) => {
          if (c.guild){
              let l = uniqueG.indexOf(c.guild)
              if (l === -1){
                guilds.push(c)
                uniqueG.push(c.guild)
              } else {
                let o = guilds[l]
                if (o.deck.length <= c.deck.length){
                  guilds[l] = c
                }
              }
          }
      })

      guilds.sort( (a, b) => {
          let aVal = a.deck.length
          let bVal = b.deck.length
          return bVal - aVal
      })

      return {
          guilds: guilds.slice(0,11),
          showGuild: 0,
          resetKey: 0,
          flickityOptions: {
              initialIndex: 0,
              prevNextButtons: false,
              pageDots: false,
              wrapAround: true,
              selectedAttraction: 0.005,
              friction: 0.08,
              cellSelector: '.carousel-cell',
              accessibility: true
          }
      }
  },
  mounted(){
      this.$store.commit('stopLoading')
  },
  methods:{
      setWarp(i){
          this.$store.commit('setWarp', i)
      },
      playPageTurn(){
          var flip = new Audio(require('../../assets/sounds/myst158.wav'))
          flip.volume = flip.volume * 0.3
          flip.play()
      },
      cycleGuilds(){
          console.log('cycling')
          this.showGuild = (this.showGuild + 1) % this.guilds.length
      },
      selectGuild(x){
          let length = this.guilds.length
          this.showGuild = x % length
          this.resetKey ++
      },
      cardInputSty(c){
          return {
              redwx : c === 'red',
              bluewx : c === 'blue',
              greenwx : c === 'green',
              yellowwx : c === 'yellow',
              purplewx : c === 'purple',
              blackwx : c === 'black',
          }
      },
      cardAge(c){
          let now = Date.now()
          let msSince = now - c.timestamp
          let days = msSince / (1000 * 60 * 60 * 24)
          return days
      }
  },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'
@import '../../styles/button'
@import '../../styles/breakpoints'

.bounty:hover
    border-style: dashed
    border-width: 3px
    border-color: yellow

h1
    text-align: center
    color: yellow

.space
    height: 1.1em


ol
    font-size: 1.5em
    li
        margin: .3em

#wrex
    width: 100%

.fw
    width: 100%

.budda
    opacity: 0.45
    float: left
    height: 0

#gift
    display: inline
    height: 3em
    clear: none

#rotate
    float: right
    height: 3em

#sundogepurp
    width:100%
    max-height:auto

#dctrlverse
    width:100%
    max-height:auto

button
    margin: .55em

p, .link
    padding: 1.4em
    font-size: 1.4em

.priorities
    color: red

.guilds
    color: green

h2
    display: inline
    clear: none

.nextg
    cursor: pointer

.fw
    width: 100%
    float: left
    opacity: 0.5

.fr
    float: right

.fl
    float: left

.arrow
    height: 3.35em

.accept, .dontaccept
    background: accent5
    padding: .789em
    border-style: none
    img
        background: white
        padding: .1em
        border-radius: 3px

.columns p
    font-size: .99em
    color: accent2

.clearboth
    clear: both

.gutter
    margin: 0 20%
    clear: both
    width: initial

.centered
    text-align: center

@keyframes nlpDoge
    0% { width: 24em; margin-left: -12em; margin-top: -6.75em; opacity: 0.68}
    100% { width: 240em; margin-left: -55em; margin-top: -85em; opacity: 0 }

.wallpaper
    position: fixed
    width: 240em
    top: 29%
    left: 50%
    margin-left: -55em
    margin-top: -85em
    opacity: 0
    animation-name: nlpDoge
    animation-duration: 322s
    transition-timing-function: ease-in
    transition-property: width, margin-left, margin-top, opacity
    z-index: -15
    border-radius: 50px

@keyframes abide
  0% { opacity: 0 }
  99.667% { opacity: 0 }
  100% { opacity: 0.5 }

.buddadoge
    position: fixed
    width: 16em
    top: 50%
    left: 50%
    margin-left: -8em
    margin-top: -16em
    opacity: 0.5
    animation-name: abide
    animation-duration: 300s
    transition-timing-function: ease
    transition-property: opacity
    z-index: -15

.bounty
    margin-bottom: 2em

.pagemargins
    margin: 0 3% 0 1%
    width: 96%



@media (min-width: breakpoint)
    .three.columns
        width: 23%
        margin-left: 2%

.up
    width: fit-content
    background: rgba(22, 22, 22, 0.8)
    border-radius: 0.5em
    margin: -1.25em auto 0.25em auto
    padding: 0.25em
    z-index: 80

.carousel-cell
    padding: 0.6em 0.5em 0.75em 0.5em
    font-size: 1.3em
    color: white
    text-align: center
    width: 16%
    height: 100%
    box-shadow: -7px 7px 7px 1px rgba(21, 21, 21, 0.5)
    margin-left: 0.78em
    margin-right: 0.78em
    .redTx
        color: red

.flickity-enabled
    width: 88%
    position: relative
    left: 50%
    transform: translateX(-50%)
    margin-bottom: 2.9em
    height: 1.2em

.transparentsides
    /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#202020+0,202020+100&1+0,0+10,0+90,1+100 */
    width: 101%
    height: 3em
    pointer-events: none
    background: -moz-linear-gradient(left,  rgba(32,32,32,1) 0%, rgba(32,32,32,0) 5%, rgba(32,32,32,0) 95%, rgba(32,32,32,1) 100%)
    background: -webkit-linear-gradient(left,  rgba(32,32,32,1) 0%,rgba(32,32,32,0) 5%,rgba(32,32,32,0) 95%,rgba(32,32,32,1) 100%)
    background: linear-gradient(to right,  rgba(32,32,32,1) 0%,rgba(32,32,32,0) 5%,rgba(32,32,32,0) 95%,rgba(32,32,32,1) 100%)
    position: absolute
    left: 0
    top: 0
    z-index: 1

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

.freshpaper
    background-image: url('../../assets/images/paper.jpg')
    opacity: 0.2

.weekoldpaper
    background-image: url('../../assets/images/paper_aged_1.png')
    opacity: 0.25

.montholdpaper
    background-image: url('../../assets/images/paper_aged_2.png')
    opacity: 0.3

.threemontholdpaper
    background-image: url('../../assets/images/paper_aged_3.png')
    opacity: 0.35

.guildname
    position: relative
    z-index: 100

.selectedguild
    color: #9ff
    font-weight: bold
    font-size: 1.25em
    margin-top: -0.13em
</style>
