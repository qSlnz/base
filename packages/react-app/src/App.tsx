import './App.css';
import { SideBar, CreatePool, Counter } from './components';
import React, { useEffect, useState } from 'react';

import { ethers, Wallet } from 'ethers';
import { API as OnboardApi, Subscriptions } from 'bnc-onboard/dist/src/interfaces';
import { API as NotifyAPI } from 'bnc-notify/dist/types/notify';


import { initNotify, initOnboard } from './utils/initOnboard';
import { NETWORKS } from './utils/networks';
import TopBar from './components/MainScreen/TopBar';
import useLookupAddress from './hooks/LookupAddress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff, faWaveSquare } from '@fortawesome/free-solid-svg-icons';
import Blockies from "react-blockies";
import { contracts } from './contracts';
import { connectAllContracts } from './contracts/Contracts';


/*****************
 * SHOULD BE SET *
 *****************/

interface Pool {
    threshold: number,
    deadline: number,
    totalStaked: number,
    executed: boolean
};

// Le network sur lequel tourne l'application
const appNetwork = NETWORKS.localhost;

// Provider vers le mainnet ethereum
const INFURA_API_KEY = "c6620abc4b344c1d97d7205817a290ce";
console.log("Infura_KEY: " + INFURA_API_KEY);

export const mainnetProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_API_KEY);
const localProvider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(appNetwork.rpcUrl);
let localSigner: ethers.providers.JsonRpcSigner;

function App() {
    // Data ethereum
    const [pools, setPools] = useState<Array<Pool>>([]);
    const [remainingTime, setRemainingTime] = useState<Array<number>>([]);

    const [activeLoadingScreen, setActiveLoadingScreen] = useState<boolean>(false);
    const [address, setAddress] = useState<string>("");
    const [network, setNetwork] = useState<number>(0);
    const [isNetworkCorrect, setIsNetworkCorrect] = useState<boolean>(true);
    const [balance, setBalance] = useState<string>("");
    const [wallet, setWallet] = useState<Wallet>(ethers.Wallet.createRandom());

    const [onboard, setOnboard] = useState<OnboardApi>();
    //const [notify, setNotify] = useState<NotifyAPI>(initNotify(appNetwork));

    const ens = useLookupAddress(address);

    useEffect(() => {
        let subscriptions: Subscriptions = {
            address: async (address: any) => {
                setAddress(address);
            },
            network: async (network: any) => {
                setNetwork(network);

                network === appNetwork.chainId ? setIsNetworkCorrect(true) : setIsNetworkCorrect(false);
            },
            balance: async (balance: any) => {
                setBalance(balance);
            },
            wallet: async (wallet: any) => {
                if (wallet.provider) {
                    setWallet(wallet);

                    localSigner = new ethers.providers.Web3Provider(
                        wallet.provider
                    ).getSigner();

                    connectAllContracts(localSigner);

                    window.localStorage.setItem('selectedWallet', wallet.name);
                } else {
                    // @ts-ignore
                    setWallet({});
                }
            }
        };

        const onboard = initOnboard(subscriptions, appNetwork);

        setOnboard(onboard);
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

    useEffect(() => {
        const getPools = async () => {
            let poolCount = await contracts.Staker.poolCount();
            let poolList: Array<Pool> = [];
            let remainingTime: Array<number> = [];

            for (let poolId = 0; poolCount.gt(poolId); poolId++) {
                let res = await contracts.Staker.pools(poolId);

                let newPool: Pool = {
                    threshold: parseFloat(ethers.utils.formatEther(res.threshold)),
                    totalStaked: parseFloat(res.totalStaked.toString()),
                    deadline: parseInt(res.deadline.toString()),
                    executed: res.executed
                }

                remainingTime.push(parseInt(res.deadline.toString()) - Math.round((Date.now() / 1000)));
                poolList.push(newPool);
            }

            setRemainingTime(remainingTime);
            setPools(poolList);
        };

        if (address && checkNetwork() && pools.length == 0) {
            console.log("On populate la population");

            getPools();
        } else {
            console.log("On populate PAS la population");
        }
    }, [address, network]);

    useEffect(() => {
        console.log("JPP");

        if (pools.length == 0) {
            return;
        }

        console.log("nique ta pute de mère");

        const timer = setInterval(() => {
            // let newTime: Array<number> = [...remainingTime];

            // for (let i = 0; i < newTime.length; i++) {
            //     newTime[i] = newTime[i] + 1;
            // }

            setRemainingTime(remainingTime => remainingTime.map(el => el + 1));
        }, 1000);

        return () => {
            clearInterval(timer);
        }
    }, [pools]);

    /* Check if the connected network is the network of the app */
    const checkNetwork = () => {
        if (onboard) {
            return network === appNetwork.chainId;
        }

        return false;
    }

    return (
        <div className="App">
            <SideBar />
            <div className="mainscreen">
                {
                    (onboard) && !activeLoadingScreen ?
                        ""
                        :
                        <div className="loadingscreen">
                            <div className="loadingscreen-text">Loading</div>
                        </div>
                }
                <TopBar />
                <div className="loginbar">
                    {onboard ? (
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
                                    <div className="loginbar-button-connect-wrapper">
                                        <span className="loginbar-button-address">
                                            {ens.substr(0, 1).toUpperCase() + ens.substr(1, 11) || address.substr(0, 6) + "..." + address.substr(address.length - 4, 4)}
                                        </span>
                                        <span className="loginbar-button-identicon">
                                            <Blockies seed={address} size={6} bgColor="white" color="black" />
                                        </span>
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
                {wallet.provider && network && isNetworkCorrect && remainingTime ? (
                    <div className="appZone">
                        <CreatePool />
                        {pools.map((value, index) => {
                            return (
                                <div className="dapp-container" key={index}>
                                    <div className="dapp-box unit">
                                        <div className="dapp-unitpool-title">
                                            Pool #{index}
                                        </div>
                                        <hr></hr>
                                        <div className="dapp-unitpool-data">
                                            Total staked in the pool: {value.totalStaked}
                                        </div>
                                        <div className="dapp-unitpool-data">
                                            Value to reach: {value.threshold}
                                        </div>
                                        <Counter data={remainingTime} index={index} />
                                        <div className="dapp-unitpool-data">
                                            {value.executed}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="appZone" style={{ backgroundColor: 'royalblue' }}>

                        <div className="appZone-text">
                            Pooling made easy.
                        </div>
                    </div>
                )}
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
