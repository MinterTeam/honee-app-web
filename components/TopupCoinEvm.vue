<script>
import {getBnbMegaSwapAddress} from '~/api/heist.js';
import FieldAddressDisplay from '~/components/base/FieldAddressDisplay.vue';
import BaseLoader from '~/components/base/BaseLoader.vue';

export default {
    components: {
        BaseLoader,
        FieldAddressDisplay,
    },
    fetch() {
        return getBnbMegaSwapAddress()
            .then((address) => {
                this.address = address;
            });
    },
    data() {
        return {
            address: '',
        };
    },
};
</script>

<template>
    <div>
        <p class="u-text-medium u-mb-10">
            {{ $td(`Send from 0.01 BNB or more to this address to instantly receive MEGA tokens.`, 'todo') }}
        </p>

        <FieldAddressDisplay
            v-if="address"
            class="form-row"
            :value="address"
        />
        <div v-else-if="$fetchState.pending" class="u-text-center">
            <BaseLoader class="" :is-loading="true"/>
        </div>
        <div v-else class="form__error">
            Can't get address
        </div>
    </div>
</template>
