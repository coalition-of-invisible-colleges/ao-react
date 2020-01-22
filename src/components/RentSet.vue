<template lang='pug'>

#cashexpense
    form-box(btntxt="Update Fixed Costs"  event='rent-set' v-bind:data='details')
        div.input-container
          input#rentInput.input-effect(v-model='details.amount' type='text')
          label(for='rentInput') Set Node Cost
          span.focus-border
</template>

<script>
import SharedTitle from './slotUtils/SharedTitle'
import FormBox from './slotUtils/FormBox'

export default {
    data(){
        return {
            details: {
                type: 'rent-set',
                amount: ''
            }
        }
    },
    components: {
        SharedTitle, FormBox
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'


</style>
