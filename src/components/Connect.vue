<template lang='pug'>

#home
  .container
    h1 Connect
    aos
</template>

<script>

import Aos from './Aos'

export default {
    components:{
        Aos
    },
    mounted() {
        this.$store.commit('stopLoading')
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/breakpoints'
@import '../styles/title'

</style>
