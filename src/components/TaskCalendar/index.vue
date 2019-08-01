<template lang='pug'>

.expandedcard
    hyper-deck
</template>

<script>

import HyperDeck from '../Deck/HyperDeck'

export default {
    components:{
        HyperDeck
    },
    watch: {
        '$route': 'set'
    },
    methods: {
        set(){
            console.log("route called in taskcal")
            this.$store.commit("setParent", [])
            this.$store.commit("setPanel", [this.$route.path.split('/')[2]])
        },
    },
}

</script>

<style lang='stylus' scoped>

.expandedcard
    width: 100%

</style>
