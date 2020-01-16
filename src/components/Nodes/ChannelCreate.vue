<template lang='pug'>

#newmember
    form-box(btntxt="Ask Ao To Connect To This Node"  event='channel-created' v-bind:data='channel')
        fancy-input(labelText='Node Pubkey')
            input.input-effect(v-model='channel.pubkey' type='text')
</template>

<script>

import FormBox from '../slotUtils/FormBox'
import FancyInput from '../slotUtils/FancyInput'

export default {
    data(){
        return {
            channel: {
                resourceId: '3e568ee0-e3a1-11e8-a459-c31a1736ec1e',
                pubkey: '',
            }
        }
    },
    components: {
      FormBox, FancyInput
    }
}

</script>

<style lang='stylus' scoped>
@import '../../styles/colours'


</style>
