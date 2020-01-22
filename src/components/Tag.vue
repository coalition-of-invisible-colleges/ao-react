<template lang='pug'>

div(v-html='tag')
</template>

<script>
import qrcode from 'qrcode-generator'

export default {
    props: ['d', 'size'],
    computed: {
        tag(){
            let data = this.d
            let typeNumber = 0
            let errorCorrectionLevel = 'L'
            let qr = qrcode(typeNumber, errorCorrectionLevel)
            qr.addData(data)
            qr.make()
            let cellsize = this.size || 4
            let margin = 2
            let tag = qr.createImgTag(cellsize, margin)
            return tag
        },
    }
}

</script>

<style lang='stylus' scoped>


</style>
