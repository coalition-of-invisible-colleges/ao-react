<template lang='pug'>

.payreq
    h3 bitcoin address
    div(v-html='imgTag')
    span {{ address }}
    a(:href='"bitcoin:" + (this.address)')
        button Open Wallet
</template>

<script>

import qrcode from 'qrcode-generator'
import calculations from '../calculations'

export default {
    props: ['address'],
    computed: {
        imgTag(){
            let typeNumber = 10;
            let errorCorrectionLevel = 'L';
            let qr = qrcode(typeNumber, errorCorrectionLevel);
            let data = this.address
            try {
                qr.addData(data)
                qr.make()
            } catch(err) {
               return console.log('err from qrcode', err)
            }
            let cellsize = 4
            let margin = 2
            let tag = qr.createImgTag(cellsize, margin)
            return tag
        },
        cadAmount(){
            return 1
            // return calculations.satsToCad(this.i.sats, this.$store.state.cash.spot)
        }
    }
}

</script>

<style lang="stylus" scoped>

@import '../styles/button'
@import '../styles/colours'
@import '../styles/skeleton'

.payreq
    color: wrexblue
    background-color: rgba(0,0,0,0)
    border-radius: 0.5em
    padding: 1em
    margin-bottom: 1.654321em

a
    text-decoration: none
    color: wrexblue

.box
    word-wrap:break-word
    max-width: 500px
    z-index: 100001
    padding: 1em

h4
    word-wrap: break-word;


</style>
