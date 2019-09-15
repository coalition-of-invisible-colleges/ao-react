<template lang='pug'>

#sidewalk
    h3 sidewalk
    .row
        .four.grid
            button(@click='trySidewalk("crazy")').redwx crazy
        .four.grid
            button(@click='trySidewalk("chill")').purplewx chill
        .four.grid
            button(@click='trySidewalk("dna")').greenwx dna
    .row
        .two.columns  &nbsp;
        .four.columns
            button(@click='trySidewalk("rainbow")').yellowwx rainbow
        .four.columns
            button(@click='trySidewalk("banner")').bluewx banner
            input(v-model='banner')
    .row
        .two.grid
            button(@click='trySidewalk("color", "red")').redwx
        .two.grid
            button(@click='trySidewalk("color", "purple")').purplewx
        .two.grid
            button(@click='trySidewalk("color", "blue")').bluewx
        .two.grid
            button(@click='trySidewalk("color", "green")').greenwx
        .two.grid
            button(@click='trySidewalk("color", "yellow")').yellowwx
        .two.grid
            button(@click='trySidewalk("color", "black")').blackwx
</template>

<script>

import Hypercard from "./Card"
import BountyCard from "./Bounties/BountyCard"
import request from "superagent"
import SharedTitle from './slotUtils/SharedTitle'
import CrazyBtn from './slotUtils/CrazyBtn'
import calculations from './../calculations'
import TaskCreate from './forms/TaskCreate'
import WhyLightning from './Nodes/WhyLightning'

export default {
  data(){
      return {
          banner: 'Hello, world.'
      }
  },
  methods: {
      trySidewalk(show, color){
        request
            .put('/sidewalk')
            .send({
                type: 'sidewalk',
                show,
                color,
                banner: this.banner
            })
            .end((err,res) => {
                if (err) return console.log(err);
                console.log('createPayRec:', res.body)
            })
      },
  },
  components:{
      SharedTitle,
      Hypercard,
      CrazyBtn,
      BountyCard,
      TaskCreate,
      WhyLightning,
  },
}

</script>

<style lang="stylus" scoped>

@import './../styles/colours'
@import './../styles/skeleton'
@import './../styles/grid'
@import './../styles/button'

h3
    text-align: center

#sidewalk
    margin-bottom: 4em
    
#wrex
    width: 100%
    #vine
        width: 100%
        height: auto

#broom
    z-index: 10000
    float: right
    height: 4.9em

#sundogepurp
    width:100%
    max-height:auto

#dctrlverse
    width:100%
    max-height:auto

button
    margin: .55em
    min-height: 4em

p
    padding: 1.4em
    font-size: 1.4em

a
    font-size: 2em
    word-break: break-all
    text-decoration: none
    color: purple
    text-align: center

</style>
