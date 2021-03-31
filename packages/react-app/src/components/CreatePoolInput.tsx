import { Component, SyntheticEvent, useState } from "react";
import { ethers } from 'ethers';
import contracts from "../contracts/Contracts";


let CreatePoolInput = () => {
    const [threshold, setThreshold] = useState("");
    const [minimumAmount, setMinimumAmount] = useState("");

    function handleChange(key: string, inputIndex: number) {
        console.log(key);
        inputIndex == 0 ? setThreshold(key) : setMinimumAmount(key);
    }

    let handleSubmit = async (event: SyntheticEvent) => {
        // Création de la pool
        event.preventDefault();
        console.log("On envoie");
        let res = await contracts.Staker.createPool(threshold, minimumAmount);
        console.log(res);
    }

    return (
        <form onSubmit={handleSubmit} >
            <label>
                Threshold: time in seconds before the pool is close
                    <input type="number" value={threshold} onChange={(e) => handleChange(e.currentTarget.value, 0)} />
            </label>
            <label>
                Minimum amount to raise before the pool is a success. If this amount is not reached before threshold time is reach, the pool is canceled.
                    <input type="number" value={minimumAmount} onChange={(e) => handleChange(e.currentTarget.value, 1)} />
            </label>
            < input type="submit" value="Envoyer" />
        </form>
    );
}

export default CreatePoolInput;