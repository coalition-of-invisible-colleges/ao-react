<template lang='pug'>

#newresource
    shared-title(:title='calcTitle')
    form-box(btntxt="Delete Resource"  event='resource-removed' v-bind:data='resource')

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
            return "Remove " + name //last member to use the resource
        }
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'


</style>
