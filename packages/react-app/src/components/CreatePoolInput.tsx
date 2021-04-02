import { SyntheticEvent, useState } from "react";
import contracts from "../contracts/Contracts";
import { API as NotifyAPI } from 'bnc-notify/dist/types/notify';


let CreatePool = () => {
    const [threshold, setThreshold] = useState("0");
    const [minimumAmount, setMinimumAmount] = useState("0");
    const [showError, setShowError] = useState(false);

    function handleChange(key: string, inputIndex: number) {
        console.log(key);
        inputIndex == 0 ? setThreshold(key) : setMinimumAmount(key);
    }

    let handleSubmit = async (event: SyntheticEvent) => {
        // Création de la pool
        event.preventDefault();

        if (!(threshold) || !(minimumAmount)) {
            setShowError(true);
            return;
        } else {
            setShowError(false);
        }

        let res = await contracts.Staker.createPool(threshold, Number(minimumAmount));
        console.log(res);
    }

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
                                Threshold: time in seconds before the pool is close
                            </div>
                            <input className="dapp-createtool-label-input" type="number" value={threshold} onChange={(e) => handleChange(e.currentTarget.value, 0)} />
                        </label>
                        <br></br>
                        <br></br>
                        <label>
                            <div className="dapp-createtool-label-text">
                                Minimum amount to raise in ethers. If this amount is not reached before threshold end, the pool is canceled.
                            </div>
                            <input className="dapp-createtool-label-input" type="number" value={minimumAmount} onChange={(e) => handleChange(e.currentTarget.value, 1)} />
                        </label>
                        <br></br>
                        <input className="dapp-createpool-button" type="submit" value="Create pool" />
                    </form>
                </div>
                <div className="dapp-createtool-error">
                    {showError ? (
                        "Please fill the form my dear friend"
                    ) : ""}
                </div>
            </div>
        </div >
    );
}

export default CreatePool;