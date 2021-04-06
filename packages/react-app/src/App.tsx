import { useEffect, useState } from 'react';
import { ethers, Wallet } from 'ethers';
import { API as OnboardApi, Subscriptions } from 'bnc-onboard/dist/src/interfaces';
import { API as NotifyAPI } from 'bnc-notify/dist/types/notify';
import { initNotify, initOnboard } from './utils/initOnboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff, faWaveSquare } from '@fortawesome/free-solid-svg-icons';
import Blockies from "react-blockies";

import './App.css';
/* Components */
import { SideBar, CreatePool, PoolBox } from './components';
import TopBar from './components/MainScreen/TopBar';
/* hooks */
import useLookupAddress from './hooks/LookupAddress';
import GetPreviousWallet from './hooks/GetPreviousWallet';
/* utils*/
import { contracts, deployedNetwork } from './utils/contracts';
import { connectAllContractsWriter } from './utils/contracts/Contracts';
import { localProvider } from './utils/providers';
import networkSwitcher from './utils/networkSwitcher';

import { appNetwork } from './Constants';


// security check the correspondance with the last hardhat deployed network
if (appNetwork.chainId !== deployedNetwork.chainId || appNetwork.chainName !== deployedNetwork.name) {
    throw "Inconsistent networks information. Last deployed contracts network and app contracts are differents.";
}

/*******
 * APP *
 *******/

function App() {
    // blockchain network datas
    const [address, setAddress] = useState<string>("");
    const [network, setNetwork] = useState<number>(0);
    const [balance, setBalance] = useState<string>("");
    const [wallet, setWallet] = useState<Wallet>(ethers.Wallet.createRandom());
    const [onboard, setOnboard] = useState<OnboardApi>();
    const ens = useLookupAddress(address);

    // UI datas
    const [activeLoadingScreen, setActiveLoadingScreen] = useState<boolean>(false);
    const [isNetworkCorrect, setIsNetworkCorrect] = useState<boolean>(true);
    const [poolBoxList, setPoolBoxList] = useState<JSX.Element[]>([]);

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
                                            networkSwitcher();
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
                                    onClick={async () => { networkSwitcher(); await onboard.walletCheck(); }}>
                                    <div className="loginbar-button-text">
                                        <FontAwesomeIcon icon={faWaveSquare} />
                                        &nbsp;&nbsp;&nbsp;Wrong Network
                                    </div>
                                </div>
                            )}

                            {wallet.provider && isNetworkCorrect && (
                                <a className="loginbar-button connected" target="_blank" href={appNetwork.blockExplorer + "/address/" + address}>
                                    <div className="loginbar-button-connect-wrapper">
                                        <span className="loginbar-button-address">
                                            {ens.substr(0, 1).toUpperCase() + ens.substr(1, 11) || address.substr(0, 6) + "..." + address.substr(address.length - 4, 4)}
                                        </span>
                                        <span className="loginbar-button-identicon">
                                            <Blockies seed={address} size={6} bgColor="white" color="black" />
                                        </span>
                                    </div>
                                </a>
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

export default App;
