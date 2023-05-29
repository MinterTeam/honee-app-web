<script>
import {IS_SUBAPP_MEGACHAIN, IS_SUBAPP_MEGAGAMER} from '~/assets/variables.js';
import IndexHonee from '~/pages/-index-honee.vue';
import IndexMegachain from '~/pages/-index-megachain.vue';
import IndexMegagamer from '~/pages/-index-megagamer.vue';

const Index = IS_SUBAPP_MEGACHAIN ? IndexMegachain : IS_SUBAPP_MEGAGAMER ? IndexMegagamer : IndexHonee;

export default Index;
</script>
