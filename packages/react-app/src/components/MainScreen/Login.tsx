import { API } from "bnc-onboard/dist/src/interfaces";
import { Wallet } from "ethers/lib/ethers";
import React from "react";

let loginIn = async (onboard: API) => {
    await onboard.walletSelect();
    await onboard.walletCheck();
};

let loginOut = async (onboard: API) => {
    await onboard.walletReset();
    console.log("reload1");

    setTimeout(() => {
        console.log("reload");
        window.location.reload();
    }, 1);
};

let Login = ({ onboard, wallet }: { onboard: API, wallet: Wallet }) => {
    return (
        <div className="loginbar-login">
            {!wallet.provider && (
                <div className="loginbar-button"
                    onClick={() => { loginIn(onboard) }}>
                    <div className="loginbar-button-text">
                        Connexion
                    </div>
                </div>
            )}
            {wallet.provider && (
                <div className="loginbar-info">
                    { wallet.address}
                </div>
            )}
            {wallet.provider && (
                <div className="loginbar-button"
                    onClick={() => { loginOut(onboard) }}>
                    <div className="loginbar-button-text">
                        Deconnexion
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;

// {
//     wallet.provider && (
//         <div className="loginbar-button"
//             onClick={() => { loginIn(onboard) }}>
//             <div className="loginbar-button-text">
//                 Connexion
//                     </div>
//         </div>
//     )
// }