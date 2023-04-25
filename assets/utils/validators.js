import withParams from 'vuelidate/lib/withParams.js';

export const isValidAmount = withParams({type: 'validAmount'}, (value) => {
    return parseFloat(value) >= 0;
});
