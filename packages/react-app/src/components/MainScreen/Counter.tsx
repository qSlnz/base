import { API } from "bnc-onboard/dist/src/interfaces";
import { Wallet } from "ethers/lib/ethers";
import React from "react";
import Login from "./Login";

let LoginBar = ({ data, index }: { data: Array<number>, index: number }) => {
    return (
        <div className="dapp-unitpool-data">
            Remaining time: {data[index]}
        </div>
    )
}

export default LoginBar;