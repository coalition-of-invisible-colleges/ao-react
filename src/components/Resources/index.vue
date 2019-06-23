<template lang='pug'>

#resource
    .list(v-if='isLoggedIn')
        row(v-for="r in resources", :r="r")
    .padding(v-else)
        h5 dctrl fobtap points
        ol
            li Raspberry pi running fobtap rfid scan point.
            li Door, vending machine, ... many possibilities
</template>

<script>

import Row from "./Row"
import request from "superagent"
import SharedTitle from '../slotUtils/SharedTitle'
// import CrazyBtn from '../slotUtils/CrazyBtn'

export default {
    computed: {
        resources(){
            return this.$store.state.resources.slice().filter(r => !r.pubkey )
        },
        isLoggedIn(){
            return this.$store.getters.isLoggedIn
        },
    },
    components:{
        SharedTitle,
        Row,
        // CrazyBtn
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

#resource
    width: 100%

.padding
    padding: 1.987654321em
li
    margin-left: 1em

</style>
