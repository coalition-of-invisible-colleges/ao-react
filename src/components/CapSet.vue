<template lang='pug'>

#cashexpense
    div.input-container
        input#capInput.input-effect(v-model='details.amount' type='text'  :class='{"has-content": !!details.amount}')
        label(for="capInput") Set Monthly Cap
        span.focus-borders
    button(@click='setCap') Set Cap
</template>

<script>

export default {
    methods: {
        setCap(){
            this.$store.dispatch('makeEvent', this.details)
        }
    },
    data(){
        return {
            details: {
                type: 'cap-set',
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
