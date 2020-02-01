<template lang='pug'>

#access
    h1 Access
    resources
</template>

<script>
import Resources from './Resources'

export default {
    components:{
        Resources
    },
    mounted() {
      this.$store.commit('setMode' , 0)
        this.$store.commit('setDimension' , 2)
        this.$store.commit('stopLoading')
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/title'

</style>
