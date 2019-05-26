<template lang='pug'>

#onboarding
  h1 Onboarding {{ show }} of 7
  welcome(v-if='show==0')
  protocol(v-if='show==1')
  membership(v-if='show==2')
  events(v-if='show==3')
  space(v-if='show==4')
  tools(v-if='show==5')
  toys(v-if='show==6')
  dogeboarding(v-if='show==7')
  button#back(@click='back' v-if='show>0') Back
  button#next(@click='next' v-if='show<7') Got it
</template>

<script>

import Welcome from './Welcome'
import Protocol from './Protocol'
import Membership from './Membership'
import Events from './Events'
import Space from './Space'
import Tools from './Tools'
import Toys from './Toys'
import Dogeboarding from './Dogeboarding'

export default {
    name: 'navigation',
    components: {
        Welcome, Protocol, Dogeboarding, Membership,
        Events, Space, Tools, Toys
    },
    data(){
      return {
        show: 0
      }
    },
    methods: {
      next(){
        this.show ++
      },
      back(){
        this.show --
      }
    }

}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/button'

#back
  width:150px
  float:left
#next
  width:150px
  float:right

</style>
