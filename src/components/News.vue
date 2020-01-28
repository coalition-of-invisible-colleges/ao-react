<template lang='pug'>

#theoracle
    img.thegoldendoge(src='../assets/images/sundoge.png').center
    h1.up oracle
    hypercard.bounty(v-if='topcard'  :b='topcard'  :key='topcard.taskId'  :c='[topcard.taskId]'  :inId='$store.getters.member.memberId'  @click.capture.stop='goInNews(topcard.taskId)')
    //- missions
</template>

<script>
import Hypercard from "./Card"
import Missions from "./Missions"

export default {
  components:{
      Hypercard,Missions
  },
  mounted(){
      this.$store.commit('stopLoading')
  },
  methods:{
      goInNews(t){
          this.playPageTurn()
          let taskId = t
          let panel = [ taskId ]
          let top = panel.indexOf(t)
          let parents = [ this.$store.getters.member.memberId ]

          this.$store.dispatch("goIn", {
              parents,
              top,
              panel
          })

          this.$store.commit('startLoading', 'unicorn')
          if(this.$store.state.upgrades.mode === 'doge' && this.$store.getters.contextCard.priorities.length > 0) {
              this.$store.commit("setMode", 1)
          }
          this.$router.push("/" + this.$store.state.upgrades.mode)
      },
      playPageTurn(){
          var flip = new Audio(require('../assets/sounds/myst158.wav'))
          flip.volume = flip.volume * 0.3
          flip.play()
      },
  },
  computed: {
      topcard(){
          let news = []
          this.$store.getters.memberIds.forEach(mId => {
              let member = this.$store.getters.hashMap[mId]
              let lastUsed
              this.$store.state.members.forEach( m => {
                  if(m.memberId === mId){
                      lastUsed = m.lastUsed
                  }
              })
              if(member && lastUsed) {
                  let presence = (Date.now() - lastUsed) <= (3600000 * 4)
                  if(presence && member.priorities) {
                      member.priorities.forEach(p => {
                          let priority = Object.assign({}, this.$store.getters.hashMap[p])
                          if(!priority.dogers) {
                              priority.dogers = []
                          }
                          priority.dogers.push(member.name)
                          if(!news.some((sp, i) => {
                              if(sp.taskId === p) {
                                  news[i].weight += 1 / member.priorities.length
                                  return true
                              }
                              return false
                          })) {
                              priority.weight = 1 / member.priorities.length
                              news.push(priority)
                          }
                      })
                  }
              }
          })
          news = news.filter(c => {
              if(!c.claimed) return true
              return c.claimed.indexOf(this.$store.getters.member.memberId) === -1
          })
          news.sort((a, b) => {
              return b.weight - a.weight
          })
          if(news.length < 1) return
          let ndex = 0
          let subpriorities = news[ndex].priorities.filter(tId => {
              let subpriority = this.$store.getters.hashMap[tId]
              if(!subpriority.claimed) return true
              return subpriority.claimed.indexOf(this.$store.getters.member.memberId) === -1
          })
          if(!news[ndex].guild || subpriorities.length < 1) {
              return news[ndex]
          }
          return this.$store.getters.hashMap[subpriorities[subpriorities.length - 1]]
      }
  }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/button'
@import '../styles/breakpoints'

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
    max-width: 30em
    position: relative
    left: 50%
    transform: translateX(-50%)
    margin-top: 10.5em

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

.freshpaper
    background-image: url('../assets/images/paper.jpg')
    opacity: 0.2

.weekoldpaper
    background-image: url('../assets/images/paper_aged_1.png')
    opacity: 0.25

.montholdpaper
    background-image: url('../assets/images/paper_aged_2.png')
    opacity: 0.3

.threemontholdpaper
    background-image: url('../assets/images/paper_aged_3.png')
    opacity: 0.35

.guildname
    position: relative
    z-index: 100

.selectedguild
    color: #9ff
    font-weight: bold
    font-size: 1.25em
    margin-top: -0.13em

.thegoldendoge
    position: absolute
    left: 50%
    transform: translateX(-50%)
    top: 7em
    height: 8em
    z-index: -1
</style>
