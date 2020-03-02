<template lang='pug'>

#cashexpense
    .input-container
        input#rentInput.input-effect(v-model='details.amount' type='text'  :class='{"has-content": !!details.amount}')
        label(for='rentInput') Monthly Rent
        span.focus-border
    button(@click='setRent') Set Rent
</template>

<script>

export default {
    methods: {
        setRent(){
            this.$store.dispatch('makeEvent', this.details)
        }
    },
    data(){
        return {
            details: {
                type: 'rent-set',
                amount: ''
            }
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/input'
@import '../styles/button'

</style>
