<template lang='pug'>

.payreq
    h3 payment request for
        span.yellowtx {{ satAmount.toLocaleString() }} &#12471;
        span - {{ cadAmount }}
    div.small {{ bolt11 }}
    span(v-html='imgTag')
    span
        a(:href='"lightning:" + (this.bolt11)')
            button Open Wallet
</template>

<script>

import qrcode from 'qrcode-generator'
import calculations from '../calculations'

export default {
    props: ['bolt11'],
    computed: {
        imgTag(){
            let typeNumber = 0;
            let errorCorrectionLevel = 'L';
            let qr = qrcode(typeNumber, errorCorrectionLevel);
            let data = this.bolt11
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
            let found = this.bolt11.match(/[0-9]+/)
            return calculations.satsToCad(found[0] / 10, this.$store.state.cash.spot)
        },
        satAmount(){
            let found = this.bolt11.match(/[0-9]+/)
            return found[0] / 10
        }
    }
}

</script>

<style lang="stylus" scoped>

@import '../styles/button'
@import '../styles/colours'
@import '../styles/skeleton'

.payreq
    text-align: center
    color: wrexblue
    background-color: rgba(0,0,0,0)
    border-radius: 0.5em
    padding: 1em
    margin-bottom: 1.654321em

a
    text-decoration: none
    color: main

.box
    word-wrap:break-word
    max-width: 500px
    z-index: 100001
    padding: 1em

.paid
    color: purple
    font-size: 5em

.small
    font-size: .892em
    word-wrap: break-word
    word-break: break-all
    background: lightGrey
    color: main
    padding: 1em
    border-radius: 1em

</style>
