import { appNetwork } from "../Constants";

/* EIP-3085 support */
/* If call & if wallet is compatible with EIP-3085, will propose to the user to easily add and/or switch his network to the app network */
let networkSwitcher = () => {
    // didnt support another decimals for now
    if (appNetwork.nativeCurrency.decimals !== 18) {
        console.log("networkSwitcher> currency decimals not supported");
        return;
    }

    // support only https rpc
    if (!appNetwork.rpcUrl.startsWith("https")) {
        console.log("networkSwitcher> http rpcurl not supported");
        return;
    }

    console.log("networkSwitcher> switch");

    // @ts-ignore
    if (window && window.ethereum && typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        interface AddEthereumChainParameter {
            chainId: string; // A 0x-prefixed hexadecimal string
            chainName: string;
            nativeCurrency: {
                name: string;
                symbol: string; // 2-6 characters long
                decimals: 18;
            };
            rpcUrls: string[];
            blockExplorerUrls?: string[];
            iconUrls?: string[]; // Currently ignored.
        }

        let a: AddEthereumChainParameter = {
            chainId: "0x" + appNetwork.chainId.toString(16),
            chainName: appNetwork.chainName,
            nativeCurrency: {
                name: appNetwork.nativeCurrency.name,
                symbol: appNetwork.nativeCurrency.symbol,
                decimals: 18
            },
            rpcUrls: [appNetwork.rpcUrl],
            blockExplorerUrls: [appNetwork.blockExplorer]
        };

        // @ts-ignore
        window.ethereum.request({ method: 'wallet_addEthereumChain', params: [a] });
    }
};

export default networkSwitcher;