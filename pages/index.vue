<script>
import {IS_SUBAPP_MEGACHAIN} from '~/assets/variables.js';
import IndexHonee from '~/pages/-index-honee.vue';
import IndexMegachain from '~/pages/-index-megachain.vue';

const Index = IS_SUBAPP_MEGACHAIN ? IndexMegachain : IndexHonee;

export default Index;
</script>
