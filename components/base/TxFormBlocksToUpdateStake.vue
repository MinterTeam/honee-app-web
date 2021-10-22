<script>
import {STAKE_RECALCULATE_BLOCK_COUNT} from 'assets/variables.js';

export default {
    props: {
        successTx: {
            type: Object,
            require: true,
        },
    },
    computed: {
        blocksToUpdate() {
            if (!this.successTx) {
                return 0;
            }
            const currentBlockAfterPreviousUpdate = this.successTx.height % STAKE_RECALCULATE_BLOCK_COUNT;
            return (STAKE_RECALCULATE_BLOCK_COUNT - currentBlockAfterPreviousUpdate) % STAKE_RECALCULATE_BLOCK_COUNT;
        },
        timeToUpdate() {
            if (!this.blocksToUpdate) {
                return;
            }
            const time = this.blocksToUpdate * 5;
            const minutes = Math.floor(time / 60);
            const seconds = (time % 60).toString().padStart(2, '0');

            return `${minutes}:${seconds}`;
        },
    },
};
</script>

<template>
    <p style="font-size: 12px;">
        <slot :blocksToUpdate="blocksToUpdate" :timeToUpdate="timeToUpdate">
            {{ $td('Your stake will be updated in', 'form.stake-update-eta') }} <strong>{{ blocksToUpdate }}</strong> {{ $td('blocks', 'form.stake-update-eta-blocks') }} (~{{ timeToUpdate }} {{ $td('minutes', 'form.stake-update-eta-minutes') }})
        </slot>
    </p>
</template>
