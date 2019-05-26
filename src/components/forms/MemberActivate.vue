<template lang='pug'>

#newmember
    shared-title(:title='member.memberId')
    form-box(btntxt="Credit Member Account"  event='member-activated' v-bind:data='member')

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
