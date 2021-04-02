import { Network } from "./networks"
import Onboard from "bnc-onboard";
import { API, Subscriptions } from "bnc-onboard/dist/src/interfaces";
import Notify from 'bnc-notify'

let blocknativeId = "16b95b38-9869-4d58-b978-82322a52ff6d";

export function initOnboard(subscriptions: Subscriptions, appNetwork: Network): API {
    console.log("On crée le wallet onboard");
    let onboard = Onboard({
        dappId: blocknativeId,
        networkId: appNetwork.chainId,
        networkName: appNetwork.name,
        subscriptions: subscriptions,
        walletSelect: {
            wallets: [
                { walletName: 'metamask' },
            ]
        },
    });

    return onboard;

    // return Onboard({
    //     // dappId: blocknativeId,
    //     networkId: appNetwork.chainId

    // subscriptions: subscriptions,
    // walletSelect: {
    //     wallets: [
    //         { walletName: 'metamask' },
    //         {
    //             walletName: 'trezor',
    //             appUrl: 'https://reactdemo.blocknative.com',
    //             email: 'aaron@blocknative.com',
    //             rpcUrl: appNetwork.rpcUrl
    //         },
    //         {
    //             walletName: 'ledger',
    //             rpcUrl: appNetwork.rpcUrl
    //         },
    //         { walletName: 'authereum', disableNotifications: true },
    //         {
    //             walletName: 'lattice',
    //             appName: 'Onboard Demo',
    //             rpcUrl: appNetwork.rpcUrl
    //         },
    //         { walletName: 'coinbase' },
    //         { walletName: 'status' },
    //         { walletName: 'walletLink', rpcUrl: appNetwork.rpcUrl },
    //         {
    //             walletName: 'portis',
    //             apiKey: 'b2b7586f-2b1e-4c30-a7fb-c2d1533b153b'
    //         },
    //         { walletName: 'fortmatic', apiKey: 'pk_test_886ADCAB855632AA' },
    //         { walletName: 'torus' },
    //         { walletName: 'trust', rpcUrl: appNetwork.rpcUrl },
    //         {
    //             walletName: 'walletConnect',
    //             infuraKey: 'cea9deb6467748b0b81b920b005c10c1'
    //         },
    //         { walletName: 'opera' },
    //         { walletName: 'operaTouch' },
    //         { walletName: 'imToken', rpcUrl: appNetwork.rpcUrl },
    //         { walletName: 'meetone' },
    //         { walletName: 'mykey', rpcUrl: appNetwork.rpcUrl },
    //         { walletName: 'wallet.io', rpcUrl: appNetwork.rpcUrl },
    //         { walletName: 'huobiwallet', rpcUrl: appNetwork.rpcUrl },
    //         { walletName: 'hyperpay' },
    //         { walletName: 'atoken' },
    //         { walletName: 'liquality' },
    //         { walletName: 'frame' }
    //     ]
    // },
    // walletCheck: [
    //     { checkName: 'derivationPath' },
    //     { checkName: 'connect' },
    //     { checkName: 'accounts' },
    //     { checkName: 'network' },
    //     { checkName: 'balance', minimumBalance: '100000' }
    // ]
    // })
}

export function initNotify(appNetwork: Network) {
    return Notify({
        dappId: blocknativeId,
        networkId: appNetwork.chainId
    })
}