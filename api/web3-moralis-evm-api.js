/**
 * extend EvmApi to support editing baseUrl
 */


import { CoreProvider } from '@moralisweb3/common-core';
import { EvmApiConfigSetup } from '@moralisweb3/evm-api/lib/config/EvmApiConfigSetup';

import { ClientEvmApi } from '@moralisweb3/evm-api/lib/generated/ClientEvmApi';

const BASE_URL = 'https://deep-index.moralis.io/api/v2';

export class EvmApi extends ClientEvmApi {
    static moduleName = 'evmApi';

    static create(core, baseUrl) {
        return new EvmApi(core ?? CoreProvider.getDefault(), baseUrl);
    }

    constructor(core, baseUrl) {
        super(EvmApi.moduleName, core, baseUrl || BASE_URL);
    }

    setup() {
        EvmApiConfigSetup.register(this.core.config);
    }

    start() {
        // Nothing
    }
}

export default EvmApi;
