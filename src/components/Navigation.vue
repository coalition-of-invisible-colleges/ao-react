<template lang='pug'>

.navigation
    .pricebox
        img.bullimg(v-if='!$store.getters.isLoggedIn' src='../assets/images/dctrl.svg')
        div(v-else)
            img.bullimg(v-if='showImg === "sun"'  src="../assets/images/sunbulluni.svg"  @click='cycle("sun")')
            img.bullimg(v-if='showImg === "bull"'  src="../assets/images/bullsunbulluni.svg"  @click='cycle("bull")')
            img.bullimg(v-if='showImg === "uni"'  src="../assets/images/bulluni.svg"  @click='cycle("uni")')
        div(v-if='$store.getters.isLoggedIn')
            div(@click='setImg("sun")')
                router-link(to='/' exact) Guilds
            div(@click='setImg("uni")')
                router-link(to='/deck/')
                    span(v-if='$store.getters.inbox.length > 0')
                      img.smallbird(src='../assets/images/birdbtn.svg')
                      span {{ $store.getters.inbox.length }} |
                    span Deck
                      br
                      span.subheading ({{$store.getters.member.name}})
            div(@click='setImg("bull")')
                router-link(to='/dash' ) Dashboard
            auth
        auth(v-else)
    div.connectedstatus(v-if="$store.state.loader.connected == 'disconnected'")
      .dot.redwx
      span disconnected
    div.connectedstatus(v-if="$store.state.loader.connected == 'connecting'")
      .dot.yellowwx
      span connecting
    div.connectedstatus(v-if="$store.state.loader.connected == 'connected'")
      .dot.greenwx
      span connected
    div.connectedstatus(v-if="$store.state.loader.connectionError")
      .dot.purplewx
      span {{ $store.state.loader.connectionError }}
    div
      p {{ $store.state.loader.reqStatus }} - {{ $store.state.loader.lastPing }} ms -
      span(v-if="$store.state.loader.pendingRequests.length > 0") - {{ $store.state.loader.pendingRequests.length }} pending : {{ $store.state.loader.pendingRequests }}
</template>

<script>

import Auth from './Auth'
import calculations from '../calculations'

import CardPanel from './Deck/CardPanel'
import FancyInput from './slotUtils/FancyInput'

export default {
    name: 'navigation',
    components: { Auth, CardPanel, FancyInput },
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
        cycle(from){
            switch(from){
                case 'uni': return this.$router.push('/')
                case 'bull': return this.$router.push('/deck')
                case 'sun': return this.$router.push('/dash')
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
        }
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
    height: 11em
    cursor: pointer

.pricebox
    display: flex
    justify-content: space-between
    align-items: center
    align-content: center
    text-align: center

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

</style>
