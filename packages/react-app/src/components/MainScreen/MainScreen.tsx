import { Wallet } from "ethers/lib/ethers";
import { API } from "bnc-onboard/dist/src/interfaces";
import React from "react";
import LoginBar from "./LoginBar";
import TopBar from "./TopBar";


let MainScreen = ({ onboard, wallet }: { onboard: API, wallet: Wallet }) => {
    return (
        <div className="mainscreen">
            <TopBar />
            <LoginBar onboard={onboard} wallet={wallet} />
        </div>
    )
}

export default MainScreen;