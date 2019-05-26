<template lang='pug'>

#deactivatemember
    shared-title(title='Deactivate Member')
    form-box(btntxt="Farewell"  event='member-deactivated' v-bind:data='member')
        label memberId
        input(v-model='member.memberId' type='text')

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
                memberId: ""
            }
        }
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'

</style>
