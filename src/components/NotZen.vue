<template lang='pug'>

.notzen(:class='{ drink: dukkha === 1, cloud: dukkha <= 3 && dukkha > 1, storm: dukkha > 3 && dukkha < 10, river: dukkha >= 10 }'  @click='goBoat()') {{ dukkha }}
</template>

<script>

import HelmControl from '../utils/helm'

export default {
    props: ['taskId'],
    computed: {
        card() {
            return this.$store.getters.hashMap[this.taskId]
        },
        dukkha() {
            if(this.taskId) {
                if(this.card.priorities.length === 0) return ''
                return this.card.priorities.length
            }
            if(this.$store.getters.contextCard.priorities.length === 0) return ''
            return this.$store.getters.contextCard.priorities.length
        },
    },
    methods: {
        goBoat() {
            HelmControl.flashHelm(0.5)
            setTimeout(() => {this.$router.push("/boat") }, 100 )
        }
    }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'

.notzen
    margin-left: 51.4%
    transform: translateX(-50%)
    font-size: 2.75em
    cursor: pointer
    background-image: url('../assets/images/buddadoge.svg')
    background-size: auto 100%
    background-repeat: no-repeat
    background-position: 50%
    height: 1.3em
    padding-top: 0.6em
    padding-right: 0.09em
    font-weight: bold
    text-align: center

.drink
    color: wrexgreen

.cloud
    color: wrexyellow

.storm
    color: wrexred

.river
    color: black
</style>
