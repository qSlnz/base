import { API } from "bnc-onboard/dist/src/interfaces";
import { Wallet } from "ethers/lib/ethers";
import React from "react";
import Login from "./Login";

let LoginBar = ({ onboard, wallet }: { onboard: API, wallet: Wallet }) => {
    return (
        <div className="loginbar">
            <Login onboard={onboard} wallet={wallet} />
        </div>
    )
}

export default LoginBar;