<template lang='pug'>

.navigation
    img.bullimgright(v-if='!$store.state.upgrades.mode'  src="../assets/images/bullsunbulluni.svg"  @click='$router.push("/dash")')
    img.bullimg(v-if='showImg === "bull"'  src="../assets/images/bullsunbulluni.svg"  @click='cycle')
    img.bullimg(v-else-if='showImg === "sun"'  src="../assets/images/sunbulluni.svg"  @click='cycle')
    img.bullimg(v-else  src="../assets/images/bulluni.svg"  @click='cycle')
    .faded(@click='nextUpgradeMode')
        img.upg.boat(v-if='$store.state.upgrades.mode === "boat"'  src='../assets/images/boatblack.svg')
        img.upg(v-if='$store.state.upgrades.mode === "badge"'  src='../assets/images/guildwithwhitenobkgrnd.png')
        img.upg(v-if='$store.state.upgrades.mode === "bounty"'  src='../assets/images/treasurechestnobkgrndwhiteD.png')
        img.upg(v-if='$store.state.upgrades.mode === "timecube"'  src='../assets/images/timecubewithwhite.png')
    button.topcenter(v-if='!$store.state.upgrades.mode'  @click="killSession") log out
    template(v-for='(n, i) in $store.state.context.parent.slice().reverse()')
        div(@click='goToParent(n)')
            context(:taskId='n')
</template>

<script>

import Auth from './Auth'
import calculations from '../calculations'
import CardPanel from './Deck/CardPanel'
import FancyInput from './slotUtils/FancyInput'
import Context from './Deck/Context'

export default {
    name: 'navigation',
    components: { Auth, CardPanel, FancyInput, Context },
    mounted(){
        this.setToRoute()
    },
    watch: {
      '$route': 'setToRoute'
    },
    data(){
        return {
            showBtc: false,
            search: '',
            showImg: 'uni',
        }
    },
    methods: {
        killSession(){
            this.$store.dispatch("makeEvent", {
                type: "session-killed",
                session: this.$store.state.loader.session
            })
        },
        goToParent(target){
            console.log("go to parent called")
            this.$store.dispatch("goUp", {
                target,
                panel: [target],
                top: 0
            })
        },
        cycle(from){
            switch (this.$router.currentRoute.path){
              case "/": return this.$router.push('/deck')
              case "/dash": return this.$router.push('/deck')
            }

            if (this.$store.state.context.parent.length > 0){
                this.$router.push('/deck')
                this.$store.commit("setParent", [])
            } else {
                this.$router.push('/')
            }
            this.setToRoute()
        },
        setToRoute(){
            switch (this.$router.currentRoute.path){
              case "/": return this.showImg = "sun"
              case "/dash": return this.showImg = "bull"
              default: return this.showImg = "uni"
            }
        },
        toggleShowBtc(){
            this.showBtc = !this.showBtc
        },
        setImg(x){
            console.log("setting image", {x})
            this.showImg = x
            if (x === 'uni'){
                this.$store.commit("setPanel", [this.$store.getters.member.memberId])
                this.$store.commit("setParent", [])
            }
        },
        nextUpgradeMode(){
            this.$store.commit("nextMode")
        },
    },
    computed: {
        sats(){
            let sats = calculations.cadToSats( 1 , this.$store.state.cash.spot )
            return parseInt( sats )
        },
        cadPrice(){
            return parseFloat( this.$store.state.cash.spot.toFixed(2) )
        },
    }
}

function updateTransition() {
  var btc = document.querySelector("span.btc");
  var sat = document.querySelector("span.sat");

  if (btc) {
      btc.className = "sat"
  }
  if(sat){
      sat.className="btc"
  }

}

updateTransition();
var intervalID = window.setInterval(updateTransition, 7000);

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/grid'
// @import '../styles/button'

.navigation
  display: flex
  flex-direction: column-reverse
  min-height: 5.8em

.side_bar ul
  margin-left: 10px;

.toggle ul
  padding-left:0;

a
  text-decoration: none;
  color: accent1
  padding: 10px 20px;
  margin-bottom: 0;
  margin-left:auto;
  margin-right:auto;
  list-style: none;
  font-family:sans-serif
  display: block;
  margin-bottom:5px
  max-width:360px
  text-align:center;
  background-color:accent5

a:hover, .router-link-active
  background-color: accent4
  color:contentColour
  border-style: none

a.router-link-active
    background-color: purple
    color:contentColour
    :hover
        background-color: purple

.admin
  color: main
  background: green
  border-radius: .6em
  padding: .5em

li
    color: accent2

.p
    color: white
    text-align: center
    padding: 1em

hr
    color: lightteal

.bullimg
    width: 7em
    cursor: pointer
    // float: left
    flex-direction: column
    display: flex
    position: absolute
    left: 0
    top: 0

.bullimgright
    width: 7em
    cursor: pointer
    // float: left
    flex-direction: column
    display: flex
    position: absolute
    right: 0
    top: 0

.btc
    border: 2px purple solid
    border-radius: 5px
    background-color: purple
    color: white
    height: 4em
    margin-left: 0.5em
    margin-right: 0.5em
    margin-top: 1.5em
    margin-bottom: 0em
    -webkit-transition-property: background-color margin-bottom margin-top border;
    -webkit-transition-duration: 7s;
    -webkit-transition-timing-function: ease-in-out;
    transition-property: background-color margin-bottom margin-top border;
    transition-duration: 7s;
    transition-timing-function: ease-in-out;

.sat
    border: 2px teal solid
    border-radius: 5px
    background-color: teal
    color: white
    height: 4em
    margin-top: 0em
    margin-bottom: 1.5em
    -webkit-transition-property: background-color margin-bottom margin-top border;
    -webkit-transition-duration: 7s;
    -webkit-transition-timing-function: ease-in-out;
    transition-property: background-color margin-bottom margin-top border;
    transition-duration: 7s;
    transition-timing-function: ease-in-out;

.smallbird
    height:1em

.tr
    opacity: 0.95

.subheading
    opacity: 0.9
    font-size: 85%

.connectedstatus
    margin-top: 1em

.dot
  height: 0.5em
  width: 0.5em
  border-radius: 50%
  display: inline-block
  margin-right: 0.5em

.faded
    opacity: 0.4

.upg
    width: 5em
    padding: 1em
    // float: right
    position: absolute
    top: 0
    right: 0
    cursor: pointer

.topauth
    max-width: 50%
    padding: 1em
    // float: right
    position: absolute
    top: 0
    right: 0
    cursor: pointer

.topcenter
    position: absolute
    top: 0
    left: 50%
    background: wrexred
    color: white
    padding-left: 2em
    padding-right: 2em
    padding-top: .29em
    padding-bottom: .29em


.boat
    width: 7em
    padding: 1em 0

.context
    width: calc(100% - 14em)
    margin: 0 7em
    align-self: flex-end

.fl
    float: left

.fr
    float: right
    width: 7em


</style>
