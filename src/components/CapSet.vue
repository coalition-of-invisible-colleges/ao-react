<template lang='pug'>

#cashexpense
    form-box(btntxt="Update Maximum Monthly Charge"  event='cap-set' v-bind:data='details')
        div.input-container
            input#capInput.input-effect(v-model='details.amount' type='text')
            label(for="capInput") Set Monthly Cap
            span.focus-borders
</template>

<script>

import FormBox from './FormBox'

export default {
    data(){
        return {
            details: {
                type: 'cap-set',
                amount: ''
            }
        }
    },
    components: {
         FormBox
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'


</style>
