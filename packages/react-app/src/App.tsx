import './App.css';
import { SideBar, CreatePool, Counter } from './components';
import React, { useEffect, useState } from 'react';

import { ethers, providers, Wallet } from 'ethers';
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
import { connectAllContractsReader, connectAllContractsWriter } from './contracts/Contracts';
import GetPreviousWallet from './hooks/GetPreviousWallet';
import Pool from './utils/type';

/*****************
 * MUST BE SET *
 *****************/

// Network where the application is running
// Set manually to avoid mistake
// TODO: check the correspondance with the current hardhat network
const appNetwork = NETWORKS.localhost;

// Provider linked to mainnet
const INFURA_API_KEY = "c6620abc4b344c1d97d7205817a290ce";
export const mainnetProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_API_KEY);

// Provider linked to appnet
export const localProvider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(appNetwork.rpcUrl);
connectAllContractsReader(localProvider);

/*******
 * APP *
 *******/

function App() {
    // application datas
    const [pools, setPools] = useState<Array<Pool>>([]);

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

                network === appNetwork.chainId ? setIsNetworkCorrect(true) : setIsNetworkCorrect(false);
            },
            balance: async (balance: any) => {
                setBalance(balance);
            },
            wallet: async (wallet: any) => {
                if (wallet.provider) {
                    setWallet(wallet);

                    let localSigner = new ethers.providers.Web3Provider(
                        wallet.provider
                    ).getSigner();

                    connectAllContractsWriter(localSigner);

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

    let addNewPool = async (poolId: number) => {
        let res = await contracts.StakerReader.pools(poolId);

        const remainingTime = parseInt(res.deadline.toString()) - Math.round(Date.now() / 1000) < 0 ? 0 : parseInt(res.deadline.toString()) - Math.round(Date.now() / 1000);

        let newPool: Pool = {
            poolId: poolId,
            threshold: parseFloat(ethers.utils.formatEther(res.threshold)),
            totalStaked: parseFloat(ethers.utils.formatEther(res.totalStaked)),
            deadline: parseInt(res.deadline.toString()),
            executed: res.executed,
            remainingTime: remainingTime
        };

        return newPool;
    };

    // when wallet + network is ready > add existing pools + event connection (new pool, new stake, pool execution)
    useEffect(() => {
        const getPools = async () => {
            let poolCount = await contracts.StakerReader.poolCount();
            let newPools: Array<Pool> = [];

            for (let poolId = 0; poolCount.gt(poolId); poolId++) {
                newPools.push(await addNewPool(poolId));
            }

            setPools(prevPools => prevPools.concat(newPools));

            let creationPoolEventFilter = contracts.StakerReader.filters.PoolCreation(null, null);

            contracts.StakerReader.on(creationPoolEventFilter, async (address, poolId, event) => {
                console.log("Event: creationPoolEventFilter: " + address + ", " + poolId + ", " + event);

                let id = parseInt(poolId.toString());
                let newPool = await addNewPool(id);

                setPools(prevPools => {
                    /* handle case double add */
                    if (!prevPools[id]) {
                        return prevPools.concat(newPool)
                    } else {
                        return prevPools;
                    }
                });
            });

            let stakeEventFilter = contracts.StakerReader.filters.Stake(null, null, null);

            contracts.StakerReader.on(stakeEventFilter, async (poolId, staker, amount) => {
                console.log("Event: stakeEventFilter: " + poolId + ", " + staker + ", " + amount);
                const i = parseInt(poolId.toString());

                setPools(prevPools => {
                    const newPoolsList = [...prevPools];
                    let newPool = newPoolsList[i];
                    newPool.totalStaked += parseFloat(ethers.utils.formatEther(amount));
                    newPoolsList[i] = newPool;
                    return newPoolsList;
                });
            });

            let executeEventFilter = contracts.StakerReader.filters.PoolExecuted(null);

            contracts.StakerReader.on(executeEventFilter, async (poolId) => {
                console.log("Event: executeEventFilter: " + poolId);
                const i = parseInt(poolId.toString());

                setPools(prevPools => {
                    const newPoolsList = [...prevPools];
                    let newPool = newPoolsList[i];
                    newPool.executed = true;
                    newPoolsList[i] = newPool;
                    return newPoolsList;
                });
            });
        };

        if (address && checkNetwork() && pools.length == 0) {
            console.log("Retrieve all pools created");
            getPools();
        } else {
            console.log("On populate PAS la population");
        }
    }, [address, network]);

    useEffect(() => {
        if (pools.length == 0) {
            return;
        }

        const timer = setInterval(() => {
            console.log("Decrease remaining Time");
            setPools(pools => pools.map(pool => {
                const updatePool: Pool = pool;
                updatePool.remainingTime = updatePool.remainingTime - 1 <= 0 ? 0 : updatePool.remainingTime - 1;
                return updatePool;
            }));

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
                {wallet.provider && network && isNetworkCorrect ? (
                    <div className="appZone">
                        <CreatePool />
                        {pools.slice(0).reverse().map((pool) => {
                            return (
                                <div className="dapp-container" key={pool.poolId}>
                                    <div className="dapp-box unit">
                                        <div className="dapp-unitpool-title">
                                            Pool #{pool.poolId}
                                        </div>
                                        <hr></hr>
                                        <div className="dapp-unitpool-data">
                                            Total staked in the pool: {pool.totalStaked} eth
                                        </div>
                                        <div className="dapp-unitpool-data">
                                            Value to reach: {pool.threshold} eth
                                        </div>
                                        <Counter data={pool.remainingTime} />
                                        {pool.remainingTime <= 0 && pool.threshold > pool.totalStaked &&
                                            <div className="dapp-unitpool-data" style={{ backgroundColor: "brown" }}>
                                                Pool close without reaching the minimal required amount
                                            </div>
                                        }
                                        {pool.remainingTime <= 0 && pool.threshold <= pool.totalStaked && !pool.executed &&
                                            <div className="dapp-unitpool-data" style={{ backgroundColor: "orange" }}>
                                                The pool is a success ! You can know send the collected amount
                                            </div>
                                        }
                                        {pool.remainingTime <= 0 && pool.threshold <= pool.totalStaked && !pool.executed &&
                                            <div className="dapp-unitpool-button execute" onClick={
                                                async () => {
                                                    try {
                                                        await contracts.StakerWriter.execute(pool.poolId);
                                                    } catch {
                                                    }
                                                }
                                            }>
                                                Send pool fund
                                            </div>
                                        }
                                        {pool.remainingTime <= 0 && pool.threshold <= pool.totalStaked && pool.executed &&
                                            <div className="dapp-unitpool-data" style={{ backgroundColor: "#3CB371" }}>
                                                The pool is a success and the colleted amount has been sent
                                            </div>
                                        }
                                        {pool.remainingTime > 0 &&
                                            <div className="dapp-unitpool-data">
                                                The pool is open, you can contribute if you feels generous :)
                                            </div>
                                        }
                                        {pool.remainingTime > 0 &&
                                            <div className="dapp-unitpool-button contribute" onClick={
                                                async () => {
                                                    try {
                                                        await contracts.StakerWriter.stake(pool.poolId, { value: ethers.utils.parseEther("1") });
                                                    } catch (e) {
                                                        console.log(e);
                                                    }
                                                }
                                            }>
                                                Contribute 1 ether
                                            </div>
                                        }
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
