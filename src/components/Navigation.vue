<template lang='pug'>

.navigation(@contextmenu.prevent)
    img.bullimgright(v-if='showImg === "uni" && !uniRight'  src="../assets/images/bulluni.svg"  @click='cycleRight')
    img.bullimgright(v-else-if='showImg === "uni" && uniRight'  src="../assets/images/unibull.svg"  @click='cycleRight')
    img.bullimgright(v-else  src="../assets/images/bullsunbulluni.svg"  @click='cycleRight')
    img.bullimgleft(v-if='showImg === "bull"'  src="../assets/images/sunbulluni.svg"  @click='cycleLeft')
    img.bullimgleft(v-else-if='showImg === "sun"'  src="../assets/images/sunbulluni.svg"  @click='cycleLeft')
    img.bullimgleft(v-else-if='!uniLeft'  src="../assets/images/bulluni.svg"  @click='cycleLeft')
    img.bullimgleft(v-else='uniLeft'  src="../assets/images/unibull.svg"  @click='cycleLeft')
    button.topcenter(:class='{ logout : !$store.state.upgrades.mode && $store.getters.isLoggedIn }' id='helm')
        .full(v-if='$store.state.upgrades.mode && $store.getters.isLoggedIn')
            img.upg(v-if='$store.state.upgrades.mode === "boat"'  src='../assets/images/boatblack.svg')
            img.upg(v-else-if='$store.state.upgrades.mode === "badge"'  src='../assets/images/badge.svg')
            img.upg(v-else-if='$store.state.upgrades.mode === "bounty"'  src='../assets/images/bounty.svg')
            img.upg(v-else='$store.state.upgrades.mode === "timecube"'  src='../assets/images/timecube.svg')
        .full(v-else) log out
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
    mounted() {
        this.setToRoute()
        var el = document.getElementById('helm')
        var mc = new Hammer.Manager(el)

        var Swipe = new Hammer.Swipe()
        mc.add(Swipe)
        mc.on('swipeleft', (e) => {
            this.flashHelm()
            this.previousUpgradeMode()
        });

        mc.on('swiperight', (e) => {
            this.flashHelm()
            this.nextUpgradeMode()
        });

        mc.on('swipeup', (e) => {
            this.flashHelm()
            this.closeUpgrades()
        });

        mc.on('swipedown', (e) => {
            this.flashHelm()
            this.nextUpgradeMode()
        });

        var Press = new Hammer.Press({
          time: 500
        });
        mc.add(Press)
        mc.on('press', (e) => {
            if(this.$router.currentRoute.path === '/'){
                if(this.$store.state.upgrades.mode === 'boat') {
                    this.flashHelm(5)
                } else {
                    this.flashHelm(2)
                    this.$store.state.upgrades.mode = 'boat'
                }
            } else {
                this.flashHelm(2)
                this.$router.push('/')
            }
        });

        var Tap = new Hammer.Tap({ time: 500 })
        mc.add(Tap)
        mc.on('tap', (e) => {
            this.flashHelm(0.5)
            this.nextUpgradeMode()
        });

    },
    watch: {
      '$route': 'setToRoute'
    },
    data(){
        return {
            showBtc: false,
            search: '',
            showImg: 'uni',
            uniLeft: false,
            uniRight: false
        }
    },
    methods: {
        killSession(){
            this.$store.dispatch("makeEvent", {
                type: "session-killed",
                session: this.$store.state.loader.session
            })
            this.$store.commit("setAuth" , {token: '', session: ''})
        },
        goToParent(target){
            console.log("go to parent called")
            this.$store.dispatch("goUp", {
                target,
                panel: [target],
                top: 0
            })
        },
        cycleLeft(){
            switch (this.$router.currentRoute.path){
              case "/": return this.$router.push('/deck')
              case "/dash": return this.$router.push('/')
            }
            if (this.$store.state.context.parent.length > 0){
                this.$router.push('/deck')
                this.$store.commit("setParent", [])
            } else {
                this.$router.push('/')
            }
            this.setToRoute()
            this.uniLeft = !this.uniLeft
        },
        cycleRight(){
            switch (this.$router.currentRoute.path){
              case "/dash": return this.$router.push('/deck')
            }
            if (this.$store.state.context.parent.length > 0){
                this.$router.push('/deck')
                this.$store.commit("setParent", [])
            } else {
                this.$router.push('/dash')
            }
            this.setToRoute()
            this.uniRight = !this.uniRight
        },
        setToRoute() {
            switch (this.$router.currentRoute.path){
              case "/": return this.showImg = "sun"
              case "/dash": return this.showImg = "bull"
              default: return this.showImg = "uni"
            }
        },
        toggleShowBtc() {
            this.showBtc = !this.showBtc
        },
        setImg(x) {
            console.log("setting image", {x})
            this.showImg = x
            if (x === 'uni'){
                this.$store.commit("setPanel", [this.$store.getters.member.memberId])
                this.$store.commit("setParent", [])
            }
        },
        nextUpgradeMode() {
            this.$store.commit("nextMode")
        },
        previousUpgradeMode() {
            this.$store.commit("previousMode")
        },
        closeUpgrades() {
            this.$store.commit("closeUpgrades")
        },
        helmClick() {
            if(!this.$store.state.upgrades.mode && $store.getters.isLoggedIn){
                this.killsession()
            } else {
                this.nextUpgradeMode()
            }
        },
        flashHelm(flashes = 1) {
            let ms = 350
            let helm = document.getElementById('helm')
            let addedClasses = ' flash'
            if(flashes < 1) {
                addedClasses += ' half'
                ms *= 0.7
            } else if(flashes === 2) {
                addedClasses += ' twice'
                ms *= flashes
            } else if(flashes === 5) {
                addedClasses += ' five'
                ms *= flashes
            }

            helm.className += addedClasses
            setTimeout( () => { helm.className = helm.className.replace(addedClasses, ''); }, ms)
        }
    },
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

.full
    width: 100%
    height: 100%

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

.bullimgleft
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

#helm
    cursor: pointer
    
.upg
    height: 2em

.topauth
    max-width: 50%
    padding: 1em
    // float: right
    position: absolute
    top: 0
    right: 0
    cursor: pointer

.topcenter
    position: fixed
    top: 0
    left: (50% - 5em)
    width: 10em
    background: softGray
    color: main
    padding-left: 2em
    padding-right: 2em
    padding-top: .29em
    padding-bottom: .29em
    z-index: 77777
    opacity: 0.71
    border-bottom-left-radius: 50%
    border-bottom-right-radius: 50%
    border-top: none
        
.logout
    opacity: 1
    position: absolute
    
@keyframes flashhalf
    0% { background-color: #9ff; border-color: #aff }
    100% { background-color: softGray; border-color: buttonface }

@keyframes flash
    0% { background-color: softGray; border-color: buttonface }
    50% { background-color: #9ff; border-color: #aff }
    100% { background-color: softGray; border-color: buttonface }

.topcenter.flash
    animation-name: flash
    animation-duration: 0.35s
    animation-iteration-count: 1
    transition-timing-function: ease
    transition-property: background-color

.topcenter.flash.half
    animation-name: flashhalf
    animation-duration: 0.245s

.topcenter.flash.twice
    animation-duration: 0.1725
    animation-iteration-count: 2
    
.topcenter.flash.five
    animation-duration: calc(0.1725 * 5)
    animation-iteration-count: 5

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
