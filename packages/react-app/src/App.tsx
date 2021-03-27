import './App.css';
import { SideBar, MainScreen } from './components';
import Onboard from "bnc-onboard";
import Web3 from "web3";
import { useState } from 'react';
import { NETWORKS } from './utils/networks';

let web3: Web3;

// Le network sur lequel tourne l'application
const appNetwork = NETWORKS.localhost;
// Le provider pour
const localProvider = new JsonRpcProvider(appNetwork.rpcUrl);


function App() {

    return (
        <div className="App">
            <SideBar />
            <MainScreen onboardLogin={onboardLogin} />
        </div>
    );
}

const onboard = Onboard({
    dappId: "16b95b38-9869-4d58-b978-82322a52ff6d",
    networkId: appNetwork.chainId,
    subscriptions: {
        wallet: (wallet) => {
            web3 = new Web3(wallet.provider)
        }
    },
    walletSelect: {
        wallets: [
            { walletName: "metamask", preferred: true },
            { walletName: "ledger", preferred: true },
            { walletName: "coinbase", preferred: true },
        ]
    }
});

// Connexion au wallet
const onboardLogin = async () => {
    await onboard.walletSelect();

    /* Si l'utilisateur a bien sélectionné un wallet */
    if (web3) {
        await onboard.walletCheck();
    }
};

// Déconnexion du joueur
const onboardLogout = async () => {
    await onboard.walletReset();
    setTimeout(() => {
        window.location.reload();
    }, 1);
};

// Gestion du changement de chaîne
//     window.ethereum && window.ethereum.on('chainChanged', chainId => {
//         setTimeout(() => {
//             window.location.reload();
//         }, 1);
//     });

export default App;
