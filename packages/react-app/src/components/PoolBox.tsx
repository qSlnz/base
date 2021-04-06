import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Counter } from ".";
import { contracts } from "../utils/contracts";

let PoolBox = ({ poolId, address }: { poolId: number, address: string }) => {
    const [threshold, setThreshold] = useState(0);
    const [totalStaked, setTotalStaked] = useState(0);
    const [receivingAddress, setReceivingAddress] = useState("");
    const [executed, setExecuted] = useState(false);
    const [remainingTime, setRemainingTime] = useState(-1);
    const [userBalance, setUserBalance] = useState(0);
    const [isPoolEnded, setIsPoolEnded] = useState(false);
    const [isDataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        const addNewPool = async () => {
            const res = await contracts.StakerReader.pools(poolId);
            const userBalance = await contracts.StakerReader.balances(address, poolId);

            const remainingTime = parseInt(res.deadline.toString()) - Math.round(Date.now() / 1000) < 0 ? 0 : parseInt(res.deadline.toString()) - Math.round(Date.now() / 1000);

            setThreshold(parseFloat(ethers.utils.formatEther(res.threshold)));
            setTotalStaked(parseFloat(ethers.utils.formatEther(res.totalStaked)));
            setExecuted(res.executed);
            setRemainingTime(remainingTime);
            setReceivingAddress(res.sendTo);
            setUserBalance(parseFloat(ethers.utils.formatEther(userBalance)));

            if (remainingTime > 0) {
                setIsPoolEnded(false);
            } else {
                setIsPoolEnded(true);
            }

            setDataLoaded(true);
        };

        console.log("PoolBox> get pool information: " + poolId);

        addNewPool();

        let stakeEventFilter = contracts.StakerReader.filters.Stake(poolId, null, null);
        contracts.StakerReader.on(stakeEventFilter, async (poolId, staker, amount, event) => {
            console.log("Event: stakeEventFilter: " + poolId + ", " + staker + ", " + amount + " , block: " + event.blockNumber);

            const formattedAmount = parseFloat(ethers.utils.formatEther(amount));

            setTotalStaked(oldStakedAmount => oldStakedAmount + formattedAmount);

            console.log("Staker add: > " + staker);
            console.log("My add: >" + address);

            if (staker.toLocaleLowerCase() === address.toLowerCase()) {
                console.log("Update user balance :)");
                setUserBalance(oldUserBalance => oldUserBalance + formattedAmount);
            }
        });

        let executeEventFilter = contracts.StakerReader.filters.PoolExecuted(null);
        contracts.StakerReader.on(executeEventFilter, async (poolId) => {
            console.log("Event: executeEventFilter: " + poolId);

            setExecuted(true);
        });

        let withdrawEventFilter = contracts.StakerReader.filters.PoolWithdraw(poolId, address);

        contracts.StakerReader.on(withdrawEventFilter, async (poolId) => {
            console.log("Event: withdrawEventFilter: " + poolId);

            setUserBalance(0);
        });

    }, [address]);

    // We retrieve from counter the momeent where the pool thresdhold in end
    const poolTimeout = () => {
        setIsPoolEnded(true);
    };

    const l = Math.min(100 * totalStaked / threshold, 100);
    return (
        <div className="dapp-container" key={poolId}>
            <div className="dapp-box unit">
                {receivingAddress.length > 0 &&
                    <span className="dapp-unitpool-address">
                        📄
                        <span className="dapp-unitpool-address-text">
                            {receivingAddress}
                        </span>
                    </span>
                }
                <span className="dapp-unitpool-title">
                    Pool #{poolId}
                </span>
                {totalStaked > 0 &&
                    <span className="dapp-unitpool-balance">
                        {userBalance}
                    </span>
                }
                {totalStaked <= 0 &&
                    <span className="dapp-unitpool-balance" style={{ backgroundColor: 'rgba(128, 128, 128, 0.5)', color: "rgba(255, 255, 255, 0.5)" }}>
                        {userBalance}
                    </span>
                }
                <hr></hr>
                {!isDataLoaded &&
                    <div className="dapp-unitpool-loading">
                        Loading...
                    </div>
                }
                {isDataLoaded &&
                    <div className="dapp-unitpool-data" style={{ background: `linear-gradient(90deg, #3CB371 0%, #3CB371 ${l}%, rgba(2,9,53,1) ${l}%, rgba(2,9,53,1) 100%)` }}>
                        {totalStaked} eth raised
                    </div>
                }
                {isDataLoaded && totalStaked < threshold &&
                    <div className="dapp-unitpool-data">
                        Value to reach: {threshold} eth
                                                </div>
                }
                {isDataLoaded && isDataLoaded && totalStaked >= threshold &&
                    <div className="dapp-unitpool-data" style={{ backgroundColor: "#3CB371" }}>
                        🎉 Minimum amount reached ! 🥳
                                                </div>
                }
                {isDataLoaded && remainingTime > -1 &&
                    <Counter remTime={remainingTime} poolId={poolId} timeout={poolTimeout} />
                }
                {isDataLoaded && isPoolEnded && threshold > totalStaked &&
                    <div className="dapp-unitpool-data" style={{ backgroundColor: "brown" }}>
                        Pool close without reaching the minimal required amount
                                                </div>
                }
                {isDataLoaded && isPoolEnded && threshold > totalStaked && userBalance > 0 &&
                    <div className="dapp-unitpool-button withdraw" onClick={
                        async () => {
                            try {
                                await contracts.StakerWriter.withdraw(poolId);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }>
                        💰 Withdraw your fund
                                                </div>
                }
                {isDataLoaded && isPoolEnded && threshold <= totalStaked && !executed &&
                    <div className="dapp-unitpool-data" style={{ backgroundColor: "darkorchid" }}>
                        The pool is end and it is a great success !
                                                </div>
                }
                {isDataLoaded && isPoolEnded && threshold <= totalStaked && !executed &&
                    <div className="dapp-unitpool-button execute" onClick={
                        async () => {
                            try {
                                await contracts.StakerWriter.execute(poolId);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }>
                        🚀 Send pool fund
                                                </div>
                }
                {isDataLoaded && isPoolEnded && threshold <= totalStaked && executed &&
                    <div className="dapp-unitpool-data" style={{ backgroundColor: "#3CB371" }}>
                        The pool is a success and the collected amount has been sent
                                                </div>
                }
                {isDataLoaded && !isPoolEnded &&
                    <div className="dapp-unitpool-data">
                        The pool is open, you can contribute if you feels generous :)
                                                </div>
                }
                {isDataLoaded && !isPoolEnded &&
                    <div className="dapp-unitpool-button contribute" onClick={
                        async () => {
                            try {
                                await contracts.StakerWriter.stake(poolId, { value: ethers.utils.parseEther("0.1") });
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }>
                        ❤️ Contribute 0.1 ether
                        </div>
                }
            </div>
        </div>
    )
}

export default PoolBox;