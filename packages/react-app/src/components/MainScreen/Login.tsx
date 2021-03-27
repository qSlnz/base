import { API } from "bnc-onboard/dist/src/interfaces";
import React from "react";

let Login = ({ onboardLogin }: { onboardLogin: () => Promise<void> }) => {
    return (
        <div className="loginbar-connect-button" onClick={onboardLogin}>
            <div className="loginbar-connect-button-text">
                Connexion
            </div>
        </div>
    )
}

export default Login;