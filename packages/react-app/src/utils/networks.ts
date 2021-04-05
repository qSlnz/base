interface Network {
    name: string,
    chainId: number,
    rpcUrl: string,
    color?: string,
    blockExplorer?: string,
    price?: number,
    gasPrice?: number,
    faucet?: string
};

interface Networks {
    [index: string]: Network
};

const NETWORKS: Networks = {
    localhost: {
        name: "localhost",
        color: '#666666',
        chainId: 31337,
        blockExplorer: '',
        rpcUrl: "http://" + window.location.hostname + ":8545",
    },
    polygon: {
        name: "polygon",
        color: '#2bbdf7',
        chainId: 137,
        price: 1,
        gasPrice: 1000000000,
        rpcUrl: "https://rpc-mainnet.maticvigil.com",
        faucet: "https://faucet.matic.network/",
        blockExplorer: "https://explorer-mainnet.maticvigil.com/",
    },
    mumbai: {
        name: "mumbai",
        color: "#2ddba7",
        chainId: 80001,
        price: 1,
        gasPrice: 1000000000,
        rpcUrl: "https://rpc-mumbai.maticvigil.com/v1/96960cf40f5d9a5907db9c2223e9c199cb06b131",
        blockExplorer: "https://explorer-mumbai.maticvigil.com/",
    }
};

export { NETWORKS };
export type { Network, Networks };
