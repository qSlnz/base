import './App.css';
import { SideBar, CreatePool, PoolBox } from './components';
import { useEffect, useState } from 'react';

import { ethers, Wallet } from 'ethers';
import { API as OnboardApi, Subscriptions } from 'bnc-onboard/dist/src/interfaces';
import { API as NotifyAPI } from 'bnc-notify/dist/types/notify';


import { initNotify, initOnboard } from './utils/initOnboard';
import TopBar from './components/MainScreen/TopBar';
import useLookupAddress from './hooks/LookupAddress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff, faWaveSquare } from '@fortawesome/free-solid-svg-icons';
import Blockies from "react-blockies";
import { contracts } from './utils/contracts';
import { connectAllContractsWriter } from './utils/contracts/Contracts';
import GetPreviousWallet from './hooks/GetPreviousWallet';
import { appNetwork, localProvider } from './utils/providers';

/*******
 * APP *
 *******/

function App() {
    // application datas
    const [poolBoxList, setPoolBoxList] = useState<JSX.Element[]>([]);

    // network datas
    const [address, setAddress] = useState<string>("");
    const [network, setNetwork] = useState<number>(0);
    const [balance, setBalance] = useState<string>("");
    const [wallet, setWallet] = useState<Wallet>(ethers.Wallet.createRandom());
    const [onboard, setOnboard] = useState<OnboardApi>();
    const ens = useLookupAddress(address);

    // UI datas
    const [activeLoadingScreen, setActiveLoadingScreen] = useState<boolean>(false);
    const [isNetworkCorrect, setIsNetworkCorrect] = useState<boolean>(true);

    GetPreviousWallet(onboard);

    // handle user wallet peering using onboard.js, set signer
    useEffect(() => {
        let subscriptions: Subscriptions = {
            address: async (address: any) => {
                setAddress(address);
            },
            network: async (network: any) => {
                setNetwork(network);
                console.log("New Network! > " + network);

                network === appNetwork.chainId ? setIsNetworkCorrect(true) : setIsNetworkCorrect(false);
            },
            balance: async (balance: any) => {
                setBalance(balance);
            },
            wallet: async (wallet: any) => {
                if (wallet.provider) {
                    setWallet(wallet);

                    let userSigner = new ethers.providers.Web3Provider(
                        wallet.provider
                    ).getSigner();

                    connectAllContractsWriter(userSigner);

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

    // when wallet + network is ready > add existing pools + new pool event connection
    useEffect(() => {
        const getPools = async () => {
            let blocknumber = await localProvider.getBlockNumber()
            localProvider.resetEventsBlock(blocknumber + 1);

            let poolCount = (await contracts.StakerReader.poolCount()).toString();
            let tempPoolBoxList: JSX.Element[] = [];

            console.log("App> pushing " + poolCount + " new PoolBoxes");

            for (let i = 0; i < parseInt(poolCount); i++) {
                tempPoolBoxList.push(<PoolBox poolId={i} address={address} key={i} />);
            }

            setPoolBoxList(prev => tempPoolBoxList);

            let creationPoolEventFilter = contracts.StakerReader.filters.PoolCreation(null, null);

            contracts.StakerReader.on(creationPoolEventFilter, async (poolId, address, event) => {
                console.log("Event: creationPoolEventFilter: " + address + ", " + poolId + ", " + event);

                const cleanPoolId = parseInt(poolId.toString());

                let newPoolBox = <PoolBox poolId={cleanPoolId} address={address} key={cleanPoolId} />;

                setPoolBoxList(prev => prev.concat(newPoolBox));
            });
        };

        if (address && checkNetwork()) {
            console.log("Retrieve all pools created");
            getPools();
        } else {
            console.log("On populate PAS la population");
        }

        return () => {
            contracts.StakerReader.removeAllListeners();
        };
    }, [address, network]);

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
                {wallet.provider && network && isNetworkCorrect ? (
                    <div className="appZone">
                        <CreatePool />
                        {poolBoxList.slice(0).reverse()}
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
