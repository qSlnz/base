interface NativeCurrency {
    name: string,
    symbol: string,
    decimals: number
};

interface NetworkItem {
    chainName: string,
    chainId: number,
    rpcUrl: string,
    color: string,
    blockExplorer: string,
    price?: number,
    gasPrice?: number,
    faucet?: string,
    nativeCurrency: NativeCurrency
};

interface Networks {
    localhost: NetworkItem,
    polygon: NetworkItem,
    mumbai: NetworkItem,
    kovan: NetworkItem
};

const NETWORKS: Networks = {
    localhost: {
        chainName: "localhost",
        color: '#666666',
        chainId: 31337,
        blockExplorer: '',
        rpcUrl: "http://" + window.location.hostname + ":8545",
        nativeCurrency: {
            name: "localEth",
            symbol: "lEth",
            decimals: 18
        }
    },
    polygon: {
        chainName: "polygon",
        color: '#2bbdf7',
        chainId: 137,
        price: 1,
        gasPrice: 1000000000,
        rpcUrl: "https://rpc-mainnet.maticvigil.com",
        faucet: "https://faucet.matic.network/",
        blockExplorer: "https://explorer-mainnet.maticvigil.com/",
        nativeCurrency: {
            name: "Matic",
            symbol: "Matic",
            decimals: 18
        }
    },
    mumbai: {
        chainName: "mumbai",
        color: "#2ddba7",
        chainId: 80001,
        price: 1,
        gasPrice: 1000000000,
        rpcUrl: "https://rpc-mumbai.maticvigil.com/v1/96960cf40f5d9a5907db9c2223e9c199cb06b131",
        blockExplorer: "https://explorer-mumbai.maticvigil.com/",
        nativeCurrency: {
            name: "testnet Matic",
            symbol: "tMatic",
            decimals: 18
        }
    },
    kovan: {
        chainName: "kovan",
        color: "#2eeba7",
        chainId: 42,
        rpcUrl: "https://kovan.infura.io/v3/4be20cca3d6f44f89a5f7f359ab3acfa",
        blockExplorer: "https://kovan.etherscan.io/",
        nativeCurrency: {
            name: "kovan Ethers",
            symbol: "kEth",
            decimals: 18
        }
    }
};

export type { NetworkItem };
export { NETWORKS };
