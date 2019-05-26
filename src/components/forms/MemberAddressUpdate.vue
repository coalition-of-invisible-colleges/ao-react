<template lang='pug'>

#updateaddress
    shared-title(title='Update Member Address')
    form-box(btntxt="Add Address"  event='member-address-updated' v-bind:data='member')
        label address
        input(v-model='member.address' type='text')
        label proof
        input(v-model='member.proof' type='text')

</template>

<script>
import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'

export default {
    mounted(){
        let memberId = this.$router.currentRoute.path.split('/')[2]
        if (memberId){
          this.member.memberId = memberId
        }
    },
    components: {
        SharedTitle, FormBox
    },
    data(){
        return {
            member: {
                address: '',
                proof: '',
                memberId: ''
            }
        }
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'

</style>
