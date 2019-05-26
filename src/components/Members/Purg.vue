<template lang='pug'>

#purg
    template(v-for="m in inactiveMembers")
        .bouncy.row
            .four.grid
                p {{ m.name }} {{m.balance}}
            .four.grid
                div &nbsp;
                badges(:m='m')
            .four.grid
                addr(:a="m.address")
                router-link.purgcal(:to='\'/calendar/\' + m.memberId')
                    img(src='../../assets/images/calendar.svg')
    button(@click='buildAll') Load Inactive

</template>

<script>

import Addr from './Addr'
import Badges from './Badges'

export default {
    components: {
        Addr,
        Badges,
    },
    computed: {
        inactiveMembers(){
            if (this.loadAll){
                return this.$store.state.members.filter(m => m.active <= 0)
            } else {
                return []
            }
        },
    },
    data(){
        return {
            loadAll: false
        }
    },
    methods: {
        buildAll(){
            this.loadAll = true
        }
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours'
@import '../../styles/button'
@import '../../styles/grid'

img
    height: 0.7em
    float: left
p
    margin-left: 1em

.bouncy
    position: relative;
    animation: moveX 3s linear 0.5s infinite alternate,
      moveY 0.5s linear 1s infinite alternate;

@keyframes moveX {
  from { left: 0; } to { left: 40px }
}

@keyframes moveY {
  from { top: 0; } to { top: 5px; }
}

.purgcal
    position: inline
    img
        height: 2em

</style>
