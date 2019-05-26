<template lang='pug'>

#resource
    shared-title(title='Invoices')
    .list(v-if='isLoggedIn')
        pay-req(v-for="i in invoices", :i="i")
    .padding(v-else)
        h5 dctrl invoices
        ol
            li lightning network payment requests to account or resource

</template>

<script>

import request from "superagent"
import PayReq from "../Resources/PayReq"
import SharedTitle from '../slotUtils/SharedTitle'

export default {
    computed: {
        invoices(){
            return this.$store.state.invoices
        },
        isLoggedIn(){
            return this.$store.getters.isLoggedIn
        },
    },
    components:{
        SharedTitle,
        PayReq,
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
