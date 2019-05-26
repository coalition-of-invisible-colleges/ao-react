<template lang='pug'>

#stocksupplies
    shared-title(title='replenish resource')
    form-box(btntxt="Loaded"  event='resource-stocked' v-bind:data='info')
        label Amount stocked:
        input(v-model='info.amount' type='text')
        label $ value
        input(v-model='info.paid' type='text')
        label notes
        input(v-model='info.notes' type='text')

</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'

// TODO: supplies stocked affect member...
export default {
    mounted(){
        let resourceId = this.$router.currentRoute.path.split('/')[2]
        this.info.resourceId = resourceId
        this.info.memberId = this.$store.getters.memberId
        console.log('set Ids', this.info.memberId, this.info.resourceId)
    },
    data(){
        return {
            info: {
                memberId: '',
                resourceId:'',
                paid: '',
                amount:'',
                notes: '',
            }
        }
    },
    components:{
        SharedTitle, FormBox
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/button'

p
    font-size:1.3em
    color:white
    font-family: 'Open Sans', light, sans-serif;

a
    color: accent2

h3
    text-align: left
    color:accent1
    font-family: 'Open Sans', light, sans-serif;


</style>
