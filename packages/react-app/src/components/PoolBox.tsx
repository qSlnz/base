import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Counter } from ".";
import contracts from "../contracts/Contracts";

let PoolBox = ({ poolId, address }: { poolId: number, address: string }) => {
    const [threshold, setThreshold] = useState(0);
    const [deadline, setDeadline] = useState(0);
    const [totalStaked, setTotalStaked] = useState(0);
    const [executed, setExecuted] = useState(false);
    const [remainingTime, setRemainingTime] = useState(-1);
    const [userBalance, setUserBalance] = useState(0);
    const [isPoolEnded, setIsPoolEnded] = useState(false);

    useEffect(() => {
        const addNewPool = async () => {
            const res = await contracts.StakerReader.pools(poolId);
            const userBalance = await contracts.StakerReader.balances(address, poolId);

            const remainingTime = parseInt(res.deadline.toString()) - Math.round(Date.now() / 1000) < 0 ? 0 : parseInt(res.deadline.toString()) - Math.round(Date.now() / 1000);

            setThreshold(parseFloat(ethers.utils.formatEther(res.threshold)));
            setTotalStaked(parseFloat(ethers.utils.formatEther(res.totalStaked)));
            setDeadline(parseInt(res.deadline.toString()));
            setExecuted(res.executed);
            setRemainingTime(remainingTime);
            setUserBalance(parseFloat(ethers.utils.formatEther(userBalance)));

            if (remainingTime > 0) {
                setIsPoolEnded(false);
            } else {
                setIsPoolEnded(true);
            }
        };

        console.log("PoolBox> get pool information: " + poolId);

        addNewPool();
    }, [address]);

    const poolTimeout = () => {
        setIsPoolEnded(true);
    };

    const l = Math.min(100 * totalStaked / threshold, 100);
    return (
        <div className="dapp-container" key={poolId}>
            <div className="dapp-box unit">
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
                <div className="dapp-unitpool-data" style={{ background: "linear-gradient(90deg, #3CB371 0%, #3CB371 " + `${l}%, ` + "rgba(2,9,53,1) " + `${l}%, ` + "rgba(2,9,53,1) 100%)" }}>
                    {totalStaked} eth raised
                                        </div>
                {totalStaked < threshold &&
                    <div className="dapp-unitpool-data">
                        Value to reach: {threshold} eth
                                            </div>
                }
                {totalStaked >= threshold &&
                    <div className="dapp-unitpool-data" style={{ backgroundColor: "#3CB371" }}>
                        🎉 Minimum amount reached ! 🥳
                                            </div>
                }
                {remainingTime > -1 &&
                    <Counter remTime={remainingTime} poolId={poolId} timeout={poolTimeout} />
                }
                {isPoolEnded && threshold > totalStaked &&
                    <div className="dapp-unitpool-data" style={{ backgroundColor: "brown" }}>
                        Pool close without reaching the minimal required amount
                                            </div>
                }
                {isPoolEnded && threshold > totalStaked && userBalance > 0 &&
                    <div className="dapp-unitpool-button withdraw" onClick={
                        async () => {
                            try {
                                await contracts.StakerWriter.withdraw(poolId);
                            } catch {
                            }
                        }
                    }>
                        💰 Withdraw your fund
                                            </div>
                }
                {isPoolEnded && threshold <= totalStaked && !executed &&
                    <div className="dapp-unitpool-data" style={{ backgroundColor: "darkorchid" }}>
                        The pool is end and it is a great success !
                                            </div>
                }
                {isPoolEnded && threshold <= totalStaked && !executed &&
                    <div className="dapp-unitpool-button execute" onClick={
                        async () => {
                            try {
                                await contracts.StakerWriter.execute(poolId);
                            } catch {
                            }
                        }
                    }>
                        🚀 Send pool fund
                                            </div>
                }
                {isPoolEnded && threshold <= totalStaked && executed &&
                    <div className="dapp-unitpool-data" style={{ backgroundColor: "#3CB371" }}>
                        The pool is a success and the collected amount has been sent
                                            </div>
                }
                {!isPoolEnded &&
                    <div className="dapp-unitpool-data">
                        The pool is open, you can contribute if you feels generous :)
                                            </div>
                }
                {!isPoolEnded &&
                    <div className="dapp-unitpool-button contribute" onClick={
                        async () => {
                            try {
                                await contracts.StakerWriter.stake(poolId, { value: ethers.utils.parseEther("1") });
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }>
                        ❤️ Contribute 1 ether
                                            </div>
                }
            </div>
        </div>
    )

    /*
        return (
            <div className="dapp-container create">
                <div className="dapp-box create">
                    <div className="dapp-createpool-title">
                        Create a new pool
                    </div>
                    <hr></hr>
                    <div className="dapp-createtool-input">
                        <form onSubmit={handleSubmit} >
                            <label>
                                <div className="dapp-createtool-label-text">
                                    Minimum amount to raise in ethers. If this amount is not reached before threshold end, the pool is canceled.
    
                                </div>
                                <input className="dapp-createtool-label-input" type="number" value={threshold} onChange={(e) => handleChange(e.currentTarget.value, 0)} />
                            </label>
                            <br></br>
                            <br></br>
                            <label>
                                <div className="dapp-createtool-label-text">
                                    Threshold: time in seconds before the pool is close.
                                </div>
                                <input className="dapp-createtool-label-input" type="number" value={deadline} onChange={(e) => handleChange(e.currentTarget.value, 1)} />
                            </label>
                            <br></br>
                            <input className="dapp-createpool-button" type="submit" value="📖 Create pool" />
                        </form>
                    </div>
                    <div className="dapp-createtool-error">
                        {showError ? (
                            "Please fill the form with threshold > 0 & minimum amount >= 0 my dear friend"
                        ) : ""}
                    </div>
                    <div className="dapp-createtool-indo">
                        {showInfo ? (
                            "Pool created ! 🙂"
                        ) : ""}
                    </div>
                </div>
            </div >
        );*/
}

export default PoolBox;

function address(address: any, poolId: number) {
    throw new Error("Function not implemented.");
}
