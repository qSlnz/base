import { ethers } from "ethers";
import { SyntheticEvent, useCallback, useState } from "react";
import { appNetwork } from "../Constants";
import { contracts } from "../utils/contracts";
import { mainnetProvider } from "../utils/providers";


let CreatePool = () => {
    const [threshold, setThreshold] = useState("0");
    const [deadline, setDeadline] = useState("0");
    const [receivingAddress, setReceivingAddress] = useState("0xAe5a3... or domain.eth");
    const [showError, setShowError] = useState(false);
    const [showInvalidAddress, setShowInvalidAddress] = useState(false);

    function handleChange(key: string, inputIndex: number) {
        inputIndex = Math.round(inputIndex);
        inputIndex === 0 ? setThreshold(key) : setDeadline(key);
    }

    function handleAddressChange(address: string) {
        setReceivingAddress(address);

        try {
            ethers.utils.getAddress(address);
            setShowInvalidAddress(false);
        } catch {
        }
    }

    let handleSubmit = async (event: SyntheticEvent) => {
        // Création de la pool
        event.preventDefault();

        if (!(threshold) || !(deadline) || parseFloat(deadline) <= 0 || parseFloat(threshold) < 0 || parseFloat(threshold) > 2000) {
            setShowError(true);
            return;
        } else {
            setShowError(false);
        }

        try {
            ethers.utils.getAddress(receivingAddress);
            setShowInvalidAddress(false);
        } catch {
            setShowInvalidAddress(true);
            return;
        }

        try {
            await contracts.StakerWriter.createPool(ethers.utils.parseUnits(threshold, "ether"), deadline, ethers.utils.getAddress(receivingAddress));
        } catch (e) {
            console.log(e);
        }
    }

    const updateAddress = useCallback(
        async newValue => {
            if (typeof newValue !== "undefined") {
                let address = newValue;
                if (address.indexOf(".eth") > 0 || address.indexOf(".xyz") > 0) {
                    try {
                        const possibleAddress = await mainnetProvider.resolveName(address);
                        if (possibleAddress) {
                            address = possibleAddress;
                        }
                        // eslint-disable-next-line no-empty
                    } catch (e) { }
                }

                handleAddressChange(address);
            }
        },
        [],
    );

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
                                Minimum amount to raise (in {appNetwork.nativeCurrency.name})

                            </div>
                            <input className="dapp-createtool-label-input" type="number" min="0" step="0.001" value={threshold} onChange={(e) => handleChange(e.currentTarget.value, 0)} />
                        </label>
                        <br></br>
                        <label>
                            <div className="dapp-createtool-label-text">
                                Time before the pool close (in seconds)
                            </div>
                            <input className="dapp-createtool-label-input" type="number" min="0" step="1" value={deadline} onChange={(e) => handleChange(e.currentTarget.value, 1)} />
                        </label>
                        <label>
                            <div className="dapp-createtool-label-text">
                                Address that will receive the pool funds
                            </div>
                            <input className="dapp-createtool-label-input address" spellCheck="false" type="text" min="0" step="1" maxLength={42} value={receivingAddress} onChange={(e) => updateAddress(e.currentTarget.value)} />
                        </label>
                        <br></br>
                        <input className="dapp-createpool-button" type="submit" value="📖 Create pool" />
                    </form>
                </div>
                <div className="dapp-createtool-error">
                    {showError ? (
                        "Please fill the form with 0 < threshold < 2000 & minimum amount >= 0 my dear friend"
                    ) : showInvalidAddress ? "invalid ethereum address" : ""}
                </div>
            </div>
        </div >
    );
}

export default CreatePool;