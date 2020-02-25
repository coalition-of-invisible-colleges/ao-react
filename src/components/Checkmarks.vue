<template lang='pug'>

.upgrades
    projects
    div(v-if='$store.getters.contextMember')
        current(v-for='n in $store.getters.contextCard.deck'  :memberId='n')
    div(v-else)
        current-checks(v-for='n in $store.getters.contextRelevantMembers'  :memberId='n'  :key='n')
</template>

<script>
import CurrentChecks from './CurrentChecks'
import Current from './Current'
import Projects from './Projects'


export default {
    components:{
        CurrentChecks, Projects, Current
    },
    mounted() {
        this.$store.commit('setMode' , 2)
        this.$store.commit('setDimension' , 0)
        this.$store.dispatch('loaded')
    }
}

</script>

<style lang='stylus' scoped>

</style>
