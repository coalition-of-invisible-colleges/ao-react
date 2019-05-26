<template lang='pug'>

#newmember
    shared-title(title='Member Charged')
    form-box(btntxt="Credit Member Account"  event='member-charged' v-bind:data='member')
        label member id
        input(v-model='member.memberId' type='text')
        label charged
        input(autofocus="autofocus" v-model='member.charged' type='text')
        label notes
        input(v-model='member.notes' type='text')

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
    data(){
        return {
            member: {
                memberId: '',
                charged: '',
                notes: ''
            }
        }
    },
    components: {
        SharedTitle, FormBox
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'


</style>
