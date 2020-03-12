
<template lang='pug'>

div
    template(v-for='n in links')
        .row.pad.centered(@click='$router.push("/dash/boat")')
            img.send(src='/favicon.ico')
            span {{ n }}
</template>

<script>

import request from 'superagent'

export default {
    props: ['b'],
    components: { },
    methods:{

    },
    computed: {
        links(){
            let links = []
            this.$store.state.ao.forEach(a => {
                if (a.links.indexOf(this.b.taskId) > -1) {
                    links.push(a.address)
                }
            })
            return links
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/grid';
@import '../styles/colours';

.row
    width: 100%
    cursor: pointer

.pad
    margin-top: 1em
    margin-bottom: 1em

.centered
    text-align: center
span
    font-size: 0.33em
</style>
