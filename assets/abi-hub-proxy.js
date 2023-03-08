/* eslint-disable */
// https://github.com/MinterTeam/minter-hub-proxy/blob/master/abi/contracts/MinterHubProxy.sol/MinterHubProxy.json
export default [
    {
        "inputs": [
            {
                "internalType": "contract Hub",
                "name": "_hub",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            },
            {
                "internalType": "contract IERC20",
                "name": "tokenFrom",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenFromAmount",
                "type": "uint256"
            },
            {
                "internalType": "contract IERC20",
                "name": "tokenTo",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "refundTo",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "destinationChain",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "destination",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "fee",
                "type": "uint256"
            }
        ],
        "name": "callAndTransferToChain",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "hub",
        "outputs": [
            {
                "internalType": "contract Hub",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

