/* eslint-disable */
// @ts-nocheck
// copy from @moralisweb3/evm-api/lib/esm/index.js
import { ApiModule, CoreProvider } from '@moralisweb3/common-core';
import { endpointWeightsOperation, runContractFunctionOperation, web3ApiVersionOperation, getBlockOperation, getDateToBlockOperation, getContractEventsOperation, getContractLogsOperation, getContractNFTsOperation, getMultipleNFTsOperation, getNFTContractMetadataOperation, getNFTContractTransfersOperation, getNFTLowestPriceOperation, getNFTMetadataOperation, getNFTOwnersOperation, getNFTTokenIdOwnersOperation, getNFTTradesOperation, getNFTTransfersByBlockOperation, getNFTTransfersFromToBlockOperation, getNFTTransfersOperation, getWalletNFTCollectionsOperation, getWalletNFTsOperation, getWalletNFTTransfersOperation, reSyncMetadataOperation, searchNFTsOperation, syncNFTContractOperation, getErc20ApprovalsOperation, getErc20BurnsOperation, getErc20TransfersOperation, getErc20MintsOperation, getTokenAllowanceOperation, getTokenMetadataBySymbolOperation, getTokenMetadataOperation, getTokenPriceOperation, getTokenTransfersOperation, getWalletTokenBalancesOperation, getWalletTokenTransfersOperation, getInternalTransactionsOperation, getTransactionOperation, getTransactionVerboseOperation, getWalletTransactionsOperation, getWalletTransactionsVerboseOperation, getNativeBalanceOperation, getNativeBalancesForAddressesOperation, getPairAddressOperation, getPairReservesOperation, resolveAddressOperation, resolveDomainOperation, uploadFolderOperation } from '@moralisweb3/common-evm-utils';
import { OperationResolver, NullableOperationResolver, PaginatedOperationResolver } from '@moralisweb3/api-utils';

/******************************************************************************
 Copyright (c) Microsoft Corporation.

 Permission to use, copy, modify, and/or distribute this software for any
 purpose with or without fee is hereby granted.

 THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 PERFORMANCE OF THIS SOFTWARE.
 ***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var EvmApiConfig = {
    defaultEvmApiChain: {
        name: 'defaultEvmApiChain',
        defaultValue: '0x1',
    },
};

var EvmApiConfigSetup = /** @class */ (function () {
    function EvmApiConfigSetup() {
    }
    EvmApiConfigSetup.register = function (config) {
        config.registerKey(EvmApiConfig.defaultEvmApiChain);
    };
    return EvmApiConfigSetup;
}());

var ClientEvmApi = /** @class */ (function (_super) {
    __extends(ClientEvmApi, _super);
    function ClientEvmApi() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.utils = {
            endpointWeights: function () {
                return new OperationResolver(endpointWeightsOperation, _this.baseUrl, _this.core).fetch({});
            },
            runContractFunction: function (request) {
                return new OperationResolver(runContractFunctionOperation, _this.baseUrl, _this.core).fetch(request);
            },
            web3ApiVersion: function () {
                return new OperationResolver(web3ApiVersionOperation, _this.baseUrl, _this.core).fetch({});
            },
        };
        _this.block = {
            getBlock: function (request) {
                return new NullableOperationResolver(getBlockOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getDateToBlock: function (request) {
                return new OperationResolver(getDateToBlockOperation, _this.baseUrl, _this.core).fetch(request);
            },
        };
        _this.events = {
            getContractEvents: function (request) {
                return new PaginatedOperationResolver(getContractEventsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getContractLogs: function (request) {
                return new PaginatedOperationResolver(getContractLogsOperation, _this.baseUrl, _this.core).fetch(request);
            },
        };
        _this.nft = {
            getContractNFTs: function (request) {
                return new PaginatedOperationResolver(getContractNFTsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getMultipleNFTs: function (request) {
                return new OperationResolver(getMultipleNFTsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNFTContractMetadata: function (request) {
                return new NullableOperationResolver(getNFTContractMetadataOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNFTContractTransfers: function (request) {
                return new PaginatedOperationResolver(getNFTContractTransfersOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNFTLowestPrice: function (request) {
                return new NullableOperationResolver(getNFTLowestPriceOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNFTMetadata: function (request) {
                return new NullableOperationResolver(getNFTMetadataOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNFTOwners: function (request) {
                return new PaginatedOperationResolver(getNFTOwnersOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNFTTokenIdOwners: function (request) {
                return new PaginatedOperationResolver(getNFTTokenIdOwnersOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNFTTrades: function (request) {
                return new PaginatedOperationResolver(getNFTTradesOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNFTTransfersByBlock: function (request) {
                return new PaginatedOperationResolver(getNFTTransfersByBlockOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNFTTransfersFromToBlock: function (request) {
                return new PaginatedOperationResolver(getNFTTransfersFromToBlockOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNFTTransfers: function (request) {
                return new PaginatedOperationResolver(getNFTTransfersOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getWalletNFTCollections: function (request) {
                return new PaginatedOperationResolver(getWalletNFTCollectionsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getWalletNFTs: function (request) {
                return new PaginatedOperationResolver(getWalletNFTsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getWalletNFTTransfers: function (request) {
                return new PaginatedOperationResolver(getWalletNFTTransfersOperation, _this.baseUrl, _this.core).fetch(request);
            },
            reSyncMetadata: function (request) {
                return new OperationResolver(reSyncMetadataOperation, _this.baseUrl, _this.core).fetch(request);
            },
            searchNFTs: function (request) {
                return new PaginatedOperationResolver(searchNFTsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            syncNFTContract: function (request) {
                return new OperationResolver(syncNFTContractOperation, _this.baseUrl, _this.core).fetch(request);
            },
        };
        _this.token = {
            getErc20Approvals: function (request) {
                return new PaginatedOperationResolver(getErc20ApprovalsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getErc20Burns: function (request) {
                return new PaginatedOperationResolver(getErc20BurnsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getErc20Transfers: function (request) {
                return new PaginatedOperationResolver(getErc20TransfersOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getErc20Mints: function (request) {
                return new PaginatedOperationResolver(getErc20MintsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getTokenAllowance: function (request) {
                return new OperationResolver(getTokenAllowanceOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getTokenMetadataBySymbol: function (request) {
                return new OperationResolver(getTokenMetadataBySymbolOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getTokenMetadata: function (request) {
                return new OperationResolver(getTokenMetadataOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getTokenPrice: function (request) {
                return new OperationResolver(getTokenPriceOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getTokenTransfers: function (request) {
                return new PaginatedOperationResolver(getTokenTransfersOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getWalletTokenBalances: function (request) {
                return new OperationResolver(getWalletTokenBalancesOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getWalletTokenTransfers: function (request) {
                return new PaginatedOperationResolver(getWalletTokenTransfersOperation, _this.baseUrl, _this.core).fetch(request);
            },
        };
        _this.transaction = {
            getInternalTransactions: function (request) {
                return new OperationResolver(getInternalTransactionsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getTransaction: function (request) {
                return new NullableOperationResolver(getTransactionOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getTransactionVerbose: function (request) {
                return new NullableOperationResolver(getTransactionVerboseOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getWalletTransactions: function (request) {
                return new PaginatedOperationResolver(getWalletTransactionsOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getWalletTransactionsVerbose: function (request) {
                return new PaginatedOperationResolver(getWalletTransactionsVerboseOperation, _this.baseUrl, _this.core).fetch(request);
            },
        };
        _this.balance = {
            getNativeBalance: function (request) {
                return new OperationResolver(getNativeBalanceOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getNativeBalancesForAddresses: function (request) {
                return new OperationResolver(getNativeBalancesForAddressesOperation, _this.baseUrl, _this.core).fetch(request);
            },
        };
        _this.defi = {
            getPairAddress: function (request) {
                return new OperationResolver(getPairAddressOperation, _this.baseUrl, _this.core).fetch(request);
            },
            getPairReserves: function (request) {
                return new OperationResolver(getPairReservesOperation, _this.baseUrl, _this.core).fetch(request);
            },
        };
        _this.resolve = {
            resolveAddress: function (request) {
                return new NullableOperationResolver(resolveAddressOperation, _this.baseUrl, _this.core).fetch(request);
            },
            resolveDomain: function (request) {
                return new NullableOperationResolver(resolveDomainOperation, _this.baseUrl, _this.core).fetch(request);
            },
        };
        _this.ipfs = {
            uploadFolder: function (request) {
                return new OperationResolver(uploadFolderOperation, _this.baseUrl, _this.core).fetch(request);
            },
        };
        return _this;
    }
    return ClientEvmApi;
}(ApiModule));

var BASE_URL = 'https://deep-index.moralis.io/api/v2';
var EvmApi = /** @class */ (function (_super) {
    __extends(EvmApi, _super);
    function EvmApi(core) {
        return _super.call(this, EvmApi.moduleName, core, BASE_URL) || this;
    }
    EvmApi.create = function (core) {
        return new EvmApi(core !== null && core !== void 0 ? core : CoreProvider.getDefault());
    };
    EvmApi.prototype.setup = function () {
        EvmApiConfigSetup.register(this.core.config);
    };
    EvmApi.prototype.start = function () {
        // Nothing
    };
    EvmApi.moduleName = 'evmApi';
    return EvmApi;
}(ClientEvmApi));

export { ClientEvmApi, EvmApiConfigSetup };
