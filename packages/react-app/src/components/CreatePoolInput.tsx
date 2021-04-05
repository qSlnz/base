import { SyntheticEvent, useState } from "react";
import contracts from "../contracts/Contracts";
import { API as NotifyAPI } from 'bnc-notify/dist/types/notify';


let CreatePool = () => {
    const [threshold, setThreshold] = useState("0");
    const [deadline, setDeadline] = useState("0");
    const [showError, setShowError] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    function handleChange(key: string, inputIndex: number) {
        inputIndex == 0 ? setThreshold(key) : setDeadline(key);
    }

    let handleSubmit = async (event: SyntheticEvent) => {
        // Création de la pool
        event.preventDefault();

        if (!(threshold) || !(deadline) || parseFloat(deadline) <= 0 || parseFloat(threshold) < 0) {
            setShowError(true);
            setShowInfo(false);
            return;
        } else {
            setShowError(false);
        }

        let res;

        try {
            res = await contracts.StakerWriter.createPool(threshold, deadline);
        } catch {

        }

        //setShowInfo(true);
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
                                Minimum amount to raise in ethers. If this amount is not reached before deadline end, the pool is canceled.

                            </div>
                            <input className="dapp-createtool-label-input" type="number" value={threshold} onChange={(e) => handleChange(e.currentTarget.value, 0)} />
                        </label>
                        <br></br>
                        <br></br>
                        <label>
                            <div className="dapp-createtool-label-text">
                                Rime in seconds before the pool close.
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
    );
}

export default CreatePool;