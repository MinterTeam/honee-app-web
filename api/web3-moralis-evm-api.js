/**
 * extend EvmApi to support editing baseUrl
 * https://github.com/MoralisWeb3/Moralis-JS-SDK/blob/main/packages/evmApi/src/EvmApi.ts
 */


import { CoreProvider } from '@moralisweb3/common-core';
// import { EvmApiConfigSetup } from '@moralisweb3/evm-api/lib/config/EvmApiConfigSetup';

// import { ClientEvmApi } from '@moralisweb3/evm-api/lib/generated/ClientEvmApi';
import { EvmApiConfigSetup, ClientEvmApi } from './web3-moralis-evm-api-generated.js';

// https://github.com/MoralisWeb3/Moralis-JS-SDK/blob/main/packages/evmApi/src/config/EvmApiConfigSetup.ts
// function EvmApiConfigSetupRegister(config) {
//     var EvmApiConfig = {
//         defaultEvmApiChain: {
//             name: 'defaultEvmApiChain',
//             defaultValue: '0x1',
//         },
//     };
//     config.registerKey(EvmApiConfig.defaultEvmApiChain);
// }

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
        // EvmApiConfigSetupRegister(this.core.config);
    }

    start() {
        // Nothing
    }
}

export default EvmApi;
