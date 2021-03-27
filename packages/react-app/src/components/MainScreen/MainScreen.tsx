import { API } from "bnc-onboard/dist/src/interfaces";
import React from "react";
import LoginBar from "./LoginBar";
import TopBar from "./TopBar";


let MainScreen = ({ onboardLogin }: { onboardLogin: () => Promise<void> }) => {
    return (
        <div className="mainscreen">
            <TopBar />
            <LoginBar onboardLogin={onboardLogin} />
        </div>
    )
}

export default MainScreen;