<template lang='pug'>

.upgrades
    projects
    div(v-if='$store.getters.contextMember')
        h1 todo vouchlist
    div(v-else)
        current-checks.clickable(v-for='n in $store.getters.hodlersByCompletions'  :memberId='n.taskId'  :b='b'  :completions='n.contextCompletions'  :key='n.taskId')
        current-checks(v-for='n in holdOrSent'  :memberId='n'  :b='b'  :key='n')
</template>

<script>
import CurrentChecks from './CurrentChecks'
import Projects from './Projects'

export default {
    components:{
        CurrentChecks, Projects
    },
    mounted() {
        this.$store.commit('setMode' , 2)
        this.$store.commit('setDimension' , 0)
        this.$store.dispatch('loaded')
    },
    computed: {
        holdOrSent(){
            let deck = this.b.deck
            let passedTo = this.b.passed.map(p => p[1])
            let allHoldPassed = deck.concat( passedTo )
            return allHoldPassed.filter(x => !this.$store.getters.hodlersByCompletions.some(p => p.taskId === x))
        },
        b(){
            return this.$store.getters.contextCard
        },
    },
}

</script>

<style lang='stylus' scoped>

.clickable
    cursor: pointer
</style>
