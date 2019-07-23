<template lang='pug'>

#member
    .list
        h2 {{ $store.getters.activeMembers.length }} active fobs -- showing {{showStart}} - {{showStart + 7}}
        row(v-for="m in $store.getters.sortedMembers.slice(showStart, showStart + 7)"  :m='m')
        button(@click='showNext') show next
        h2 showing {{showStart}} - {{showStart + 7}}
        input(v-model='showStart')
    .padding
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
    data(){
        return {
            showStart: 0
        }
    },
    methods: {
        showNext(){
            this.showStart = this.showStart + 7
            if (this.showStart > this.$store.getters.sortedMembers.length ){
                this.showStart = 0
            }
        },
    },
    components : {
        Bounties,
        SharedTitle,
        Row,
        CrazyBtn,
        DctrlActive,
        Addr,
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/input'
@import '../../styles/skeleton'
@import '../../styles/button'

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
