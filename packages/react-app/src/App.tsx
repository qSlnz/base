import './App.css';
import { SideBar } from './components';
import { useEffect, useState } from 'react';

import { Contract, ethers, providers, Wallet } from 'ethers';
import { API, Subscriptions } from 'bnc-onboard/dist/src/interfaces';

import { initNotify, initOnboard } from './utils/initOnboard';
import { NETWORKS } from './utils/networks';
import TopBar from './components/MainScreen/TopBar';
import useLookupAddress from './hooks/LookupAddress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff, faWaveSquare } from '@fortawesome/free-solid-svg-icons';
import { Staker, Staker__factory } from './contracts/typechain';
import Staker_ADDRESS from './contracts/Staker.address';
import Staker_ABI from './contracts/Staker.abi';
import Blockies from "react-blockies";

/*****************
 * SHOULD BE SET *
 *****************/

// Le network sur lequel tourne l'application
const appNetwork = NETWORKS.localhost;

// Provider vers le mainnet ethereum
const INFURA_API_KEY = "c6620abc4b344c1d97d7205817a290ce";
console.log("Infura_KEY: " + INFURA_API_KEY);

const mainnetProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_API_KEY);
let localProvider: ethers.providers.JsonRpcProvider | null = new ethers.providers.JsonRpcProvider(appNetwork.rpcUrl);

interface IContractList {
    Staker: Staker
};

const contractList: IContractList = {
    Staker: new ethers.Contract(Staker_ADDRESS, Staker_ABI) as Staker
};


function App() {
    const [activeLoadingScreen, setActiveLoadingScreen] = useState<boolean>(false);
    const [address, setAddress] = useState<string>("");
    const [network, setNetwork] = useState<number>(0);
    const [isNetworkCorrect, setIsNetworkCorrect] = useState<boolean>(true);
    const [balance, setBalance] = useState<string>("");
    const [wallet, setWallet] = useState<Wallet>(ethers.Wallet.createRandom());

    const [onboard, setOnboard] = useState<API>();
    const [notify, setNotify] = useState<any | null>(null);

    const ens = useLookupAddress(mainnetProvider, address);

    useEffect(() => {
        let subscriptions: Subscriptions = {
            address: setAddress,
            network: async (network: any) => {
                console.log("POPOPO " + network);
                setNetwork(network);

                network === appNetwork.chainId ? setIsNetworkCorrect(true) : setIsNetworkCorrect(false);
            },
            balance: setBalance,
            wallet: async (wallet: any) => {
                if (wallet.provider) {
                    setWallet(wallet);

                    localProvider = new ethers.providers.Web3Provider(
                        wallet.provider
                    );

                    contractList.Staker.connect(localProvider.getSigner());

                    // let staker: Staker = (new ethers.Contract(Staker_ADDRESS, Staker_ABI)) as Staker;
                    // staker = staker.connect(localProvider.getSigner());

                    // await staker.createPool(2, 2);

                    // let staker2: Staker = (new ethers.Contract(Staker_ADDRESS, Staker_ABI)) as Staker;
                    // staker2.connect(localProvider.getSigner());

                    // await staker2.createPool(2, 2);


                    window.localStorage.setItem('selectedWallet', wallet.name);
                } else {
                    localProvider = null;
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

    /* Check if the connected network is the network of the app */
    const checkNetwork = () => {
        console.log("CheckNetwork>");

        if (onboard) {
            console.log("\t\t> " + network + ", " + appNetwork.chainId);
            return network === appNetwork.chainId;
        }

        console.log("\t\t> Bad");
        return false;
    }

    return (
        <div className="App">
            <SideBar />
            <div className="mainscreen">
                {(onboard && notify) && !activeLoadingScreen ? "" : <div className="loadingscreen"><div className="loadingscreen-text">Loading</div></div>}
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

                            {wallet.provider && !isNetworkCorrect && (
                                <div className="loginbar-button badnetwork"
                                    onClick={async () => await onboard.walletCheck()}>
                                    <div className="loginbar-button-text">
                                        <FontAwesomeIcon icon={faWaveSquare} />
                                        &nbsp;&nbsp;&nbsp;Wrong Network
                                    </div>
                                </div>
                            )}

                            {wallet.provider && isNetworkCorrect && (
                                <div className="loginbar-button connected">
                                    <div className="loginbar-button-text">
                                        {ens.substr(0, 1).toUpperCase() + ens.substr(1, 13) || address.substr(0, 7) + "..." + address.substr(address.length - 5, 5)}
                                        <div className="loginbar-button-blockie">
                                            <Blockies seed={address} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {wallet.provider && (
                                <div className="loginbar-disconnect-button"
                                    onClick={async () => {
                                        setActiveLoadingScreen(true);
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
                <div className="appZone">
                    {wallet.provider && isNetworkCorrect ? (
                        <div className="appZone-createPool">
                            appzone
                        </div>
                    ) : (
                        <div className="appZone-text">
                            Pooling made easy.
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

// @ts-ignore
// if (typeof window.ethereum !== 'undefined') {
//     console.log('MetaMask is installed!');
//     // @ts-ignore
//     interface AddEthereumChainParameter {
//         chainId: string; // A 0x-prefixed hexadecimal string
//         chainName: string;
//         nativeCurrency: {
//             name: string;
//             symbol: string; // 2-6 characters long
//             decimals: 18;
//         };
//         rpcUrls: string[];
//         blockExplorerUrls?: string[];
//         iconUrls?: string[]; // Currently ignored.
//     }

//     let a: AddEthereumChainParameter = {
//         chainId: "0x89",
//         chainName: "polygon",
//         nativeCurrency: {
//             name: "Matic",
//             symbol: "Matic",
//             decimals: 18
//         },
//         rpcUrls: ["https://rpc-mainnet.maticvigil.com"],
//         blockExplorerUrls: ["https://explorer-mainnet.maticvigil.com//"]
//     };
//     // @ts-ignore
//     window.ethereum.request({ method: 'wallet_addEthereumChain', params: [a] });
// }


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
