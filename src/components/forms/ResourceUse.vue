<template lang='pug'>

#newresource
    shared-title(:title='calcTitle')
    form-box(btntxt="Register Use"  event='resource-used' v-bind:data='resource')
        // TODO

</template>

<script>
import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'

export default {
    mounted(){
        let resourceId = this.$router.currentRoute.path.split('/')[2]
        if (resourceId){
          this.resource.resourceId = resourceId
        }
    },
    data(){
        return {
            resource: {
                resourceId: '',
                memberId: this.$store.getters.member.memberId,
                amount: 1,
                charged: this.resource.resourceId,
                notes: '',
            }
        }
    },
    components: {
        SharedTitle, FormBox
    },
    computed: {
        calcTitle(){
            let name = 'nobodies'
            this.$store.state.resources.forEach( resource => {
                if (resource.resourceId === this.resource.resourceId){
                    name = resource.name
                }
            })
            return name + "'s was used last by  " //last member to use the resource
        }
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'


</style>
