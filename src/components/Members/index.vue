<template lang='pug'>

#member
    .list
        h2 {{ $store.getters.activeMembers.length }} active
        row(v-for="m in $store.getters.sortedMembers.slice(showStart, showStart + 7)"  :m='m')
        .row.menu
            .inline(@click='showBack')
                img(src='../../assets/images/left.svg')
            .inline
                p.mt {{showStart}} - {{showStart + 7}}  of {{ showTotal }}
            .inline(@click='showNext')
                img(src='../../assets/images/right.svg')
        .center
            .padding
                p believer in a transcendent future
                p possess rfid tag
                p possible human, magical entity, fairy, cyborg or alien
                strong visit a node to find out more
</template>

<script>

import _ from "lodash"
import Row from "./Row"
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
        showBack(){
            this.showStart = this.showStart - 6
            if (this.showStart < 0 ){
                this.showStart = this.$store.getters.sortedMembers.length -1
            }
        },

    },
    computed: {
        showTotal(){
            return this.$store.getters.sortedMembers.length
        }
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

.mt
    margin-top: -1em

.center
    text-align: center

.buttons
    width: 100%
    button
        width: 50%

h2
    text-align:center

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


.inline
  display:inline-block
  margin:15px


.menu
    text-align: center
    color: softGrey
    font-size: 2em
    img
        height: 2em


</style>
