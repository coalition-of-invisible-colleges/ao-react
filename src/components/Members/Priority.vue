<template lang='pug'>

.priorities
    router-link(:to='"/task/" + taskId')
        img.singleship(src='../../assets/images/singleship.svg')
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
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'

.priorities
    color: red

.singleship
    display: inline
    height: 2em
    margin-right: 2em

</style>
