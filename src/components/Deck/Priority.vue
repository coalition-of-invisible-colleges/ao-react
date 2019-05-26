<template lang='pug'>

.priorities
    router-link(:to='"/task/" + taskId')
        img.singleship(v-if='!isBounty'  src='../../assets/images/singleship.svg')
        img.singleship(v-else  src='../../assets/images/cash1.svg')
    span {{ name }} !

</template>

<script>

export default {
    props: ['taskId'],
    computed: {
        name(){
            let name
            this.$store.state.tasks.some(t => {
                if (this.taskId === t.taskId){
                    name = t.name
                    return true
                }
            })
            return name
        },
        isBounty(){
            return this.$store.getters.bounties.some( t => {
                return t.taskId === this.taskId
            })
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

.priorities
    color: white

.singleship
    display: inline
    height: 2em
    margin-right: 2em

</style>
