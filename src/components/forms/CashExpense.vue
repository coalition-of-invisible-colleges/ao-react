<template lang='pug'>

#cashexpense
    form-box(btntxt="Expend"  event='cash-decreased' v-bind:data='details')
      fancy-input(labelText='amount')
          input.input-effect(v-model='details.amount' type='text')
      fancy-input(labelText='notes')
          input.input-effect(v-model='details.notes' type='text')

</template>

<script>
import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'
import FancyInput from '../slotUtils/FancyInput'

export default {
    data(){
        return {
            details: {
                amount: '',
                notes: ''
            }
        }
    },
    components: {
        SharedTitle, FormBox, FancyInput
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'


</style>
