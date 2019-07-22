<template lang='pug'>

#member
    .list(v-if="$store.getters.isLoggedIn")
        h2 {{ $store.getters.activeMembers.length }} active fobs
        row(v-for="m in sortedMembers"  :m='m')
    .padding(v-else)
        p dctrl member
        ol
            li Believer in a transcendent future.
            li Possess dctrl rfid tag.
            li Possible human, magical entity, fairy, cyborg or alien.
        p
            strong visit a node to find out more
</template>

<script>

import _ from "lodash"
import Row from "./Row"
import request from "superagent"
import SharedTitle from '../slotUtils/SharedTitle'
import CrazyBtn from '../slotUtils/CrazyBtn'
import DctrlActive from './DctrlActive'
import Addr from './Addr'
import Bounties from '../Bounties'

export default {
    components : {
        Bounties,
        SharedTitle,
        Row,
        CrazyBtn,
        DctrlActive,
        Addr,
    },
    computed : {
        sortedMembers() {
            let sorted = this.$store.getters.recentMembers.slice().sort((a, b) => {
                console.log("a is ", a, " and b is ", b)
                if(!a || !b) return 1
                let cardA = this.$store.getters.hashMap[a.memberId]
                let cardB = this.$store.getters.hashMap[b.memberId]
                if(cardA.deck.length < cardB.deck.length) return 1
                else if(cardA.deck.length === cardB.deck.length) return 0 
                else return -1
            })
            console.log("sortedMembers is ", sorted)
            return sorted
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/input'
@import '../../styles/skeleton'

#sunexper
    width: 130%

#member
    width: 100%

li
    margin-left: 1em

.padding
    padding: 1.987654321em

.cross
    text-decoration: line-through;


</style>
