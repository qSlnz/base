import { API } from "bnc-onboard/dist/src/interfaces";
import React from "react";
import Login from "./Login";

let LoginBar = ({ onboardLogin }: { onboardLogin: () => Promise<void> }) => {
    return (
        <div className="loginbar">
            <Login onboardLogin={onboardLogin} />
        </div>
    )
}

export default LoginBar;