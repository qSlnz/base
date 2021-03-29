import './App.css';
import { SideBar } from './components';
import { useEffect, useState } from 'react';

import { ethers, Wallet } from 'ethers';
import { API, Subscriptions } from 'bnc-onboard/dist/src/interfaces';

import { initNotify, initOnboard } from './utils/initOnboard';
import { NETWORKS } from './utils/networks';
import TopBar from './components/MainScreen/TopBar';
import useLookupAddress from './hooks/LookupAddress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';

/*****************
 * SHOULD BE SET *
 *****************/

// Le network sur lequel tourne l'application
const appNetwork = NETWORKS.polygon;

// Provider vers le mainnet ethereum
const INFURA_API_KEY = "c6620abc4b344c1d97d7205817a290ce";
console.log("Infura_KEY: " + INFURA_API_KEY);
const mainnetProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_API_KEY);

let provider: any;

function App() {
    const [address, setAddress] = useState<string>("");
    const [network, setNetwork] = useState<number>(0);
    const [balance, setBalance] = useState<string>("");
    const [wallet, setWallet] = useState<Wallet>(ethers.Wallet.createRandom());

    const [onboard, setOnboard] = useState<API>();
    const [notify, setNotify] = useState<any | null>(null);

    const [toAddress, setToAddress] = useState('');

    const ens = useLookupAddress(mainnetProvider, address);

    useEffect(() => {
        let subscriptions: Subscriptions = {
            address: setAddress,
            network: setNetwork,
            balance: setBalance,
            wallet: (wallet: any) => {
                if (wallet.provider) {
                    setWallet(wallet);

                    const ethersProvider = new ethers.providers.Web3Provider(
                        wallet.provider
                    );

                    provider = ethersProvider;

                    window.localStorage.setItem('selectedWallet', wallet.name);
                } else {
                    provider = null;
                    // @ts-ignore
                    setWallet({});
                }
            }
        };

        const onboard = initOnboard(subscriptions, appNetwork);

        setOnboard(onboard);
        setNotify(initNotify(appNetwork));
    }, []);

    useEffect(() => {
        const previouslySelectedWallet = window.localStorage.getItem(
            'selectedWallet'
        );

        if (previouslySelectedWallet && onboard) {
            const loadOnboardWallet = async () => {
                const walletSelected = await onboard.walletSelect(previouslySelectedWallet);

                if (walletSelected) {
                    await onboard.walletCheck();
                }
            };

            loadOnboardWallet();
        }
    }, [onboard]);

    const checkNetwork = () => {
        if (onboard) {
            console.log("CheckNetwork: actual > " + network + "; wanted > " + appNetwork.chainId);
            return network == appNetwork.chainId;
        }
        return false;
    }

    return (
        <div className="App">
            <SideBar />
            <div className="mainscreen">
                {onboard && notify ? "" : <div className="loadingscreen"><div className="loadingscreen-text">Loading</div></div>}
                <TopBar />
                <div className="loginbar">
                    {onboard && notify ? (
                        <div className="loginbar-login">
                            {!wallet.provider && (
                                <div className="loginbar-button connexion"
                                    onClick={async () => {
                                        const walletSelected = await onboard.walletSelect();
                                        if (walletSelected) {
                                            await onboard.walletCheck();
                                        }
                                    }}>
                                    <div className="loginbar-button-text">
                                        Connexion
                                    </div>
                                </div>
                            )}

                            {wallet.provider && !checkNetwork() && (
                                <div className="loginbar-button badnetwork"
                                    onClick={async () => await onboard.walletCheck()}>
                                    <div className="loginbar-button-text">
                                        Wrong network
                                    </div>
                                </div>
                            )}

                            {wallet.provider && checkNetwork() && (
                                <div className="loginbar-button connected">
                                    <div className="loginbar-button-text">
                                        {ens.substr(0, 14) || address.substr(0, 14)}
                                    </div>
                                </div>
                            )}

                            {wallet.provider && checkNetwork() && (
                                <div className="loginbar-disconnect-button"
                                    onClick={async () => {
                                        await onboard.walletReset();

                                        window.localStorage.removeItem(
                                            'selectedWallet'
                                        );

                                        setTimeout(() => {
                                            window.location.reload();
                                        }, 0.1);
                                    }}>
                                    <FontAwesomeIcon icon={faPowerOff} />
                                </div>
                            )}
                        </div>
                    ) : ""}
                </div>
            </div>
        </div>
    );
}

// const walletChecks = [
//     { checkName: 'derivationPath' },
//     { checkName: 'accounts' },
//     { checkName: 'connect' },
//     { checkName: 'network' },
//     { checkName: 'balance', minimumBalance: '1000000' }
// ];

// const onboard = Onboard({
//     networkId: appNetwork.chainId,
//     subscriptions: {
//         wallet: (wallet) => {
//             console.log("Onboard Subscription:");
//             console.log(wallet);
//             if (wallet.type == "injected") {
//                 provider = new ethers.providers.Web3Provider(wallet.provider);
//             } else if (wallet.type == "hardware") {
//                 provider = new ethers.providers.JsonRpcProvider(wallet.provider)
//             } else if (wallet.type == "sdk") {
//                 console.log(">> sdk");
//             }

//             provider.on("network", (newNetwork: any, oldNetwork: any) => {
//                 // When a Provider makes its initial connection, it emits a "network"
//                 // event with a null oldNetwork along with the newNetwork. So, if the
//                 // oldNetwork exists, it represents a changing network
//                 console.log("test");
//                 console.log(newNetwork);
//                 console.log(oldNetwork);
//                 if (oldNetwork) {
//                     window.location.reload();
//                 }
//             });
//         }
//     },
//     walletSelect: {
//         wallets: [
//             { walletName: "metamask", preferred: true },
//             {
//                 walletName: 'ledger',
//                 rpcUrl: appNetwork.rpcUrl
//             },
//             {
//                 walletName: "walletConnect",
//                 infuraKey: "c6620abc4b344c1d97d7205817a290ce"
//             },
//             { walletName: "coinbase", preferred: true },
//         ]
//     },
//     walletCheck: walletChecks
// });



/*********
 * UTILS *
 *********/

// Connexion au wallet
// const onboardLogin = async () => {
//     await onboard.walletSelect();

//     /* Si l'utilisateur a bien sélectionné un wallet */
//     if (provider) {
//         await onboard.walletCheck();
//     }
// };

// Déconnexion du joueur
// const onboardLogout = async () => {
//     await onboard.walletReset();

//     setTimeout(() => {
//         window.location.reload();
//     }, 1);
// };

// Gestion du changement de chaîne
//     window.ethereum && window.ethereum.on('chainChanged', chainId => {
//         setTimeout(() => {
//             window.location.reload();
//         }, 1);
//     });


export default App;
