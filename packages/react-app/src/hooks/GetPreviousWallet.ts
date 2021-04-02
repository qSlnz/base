import { useEffect } from "react";
import { API as OnboardApi } from 'bnc-onboard/dist/src/interfaces';

const GetPreviousWallet = (onboard: OnboardApi | undefined) => {
    useEffect(() => {
        const previouslySelectedWallet = window.localStorage.getItem(
            'selectedWallet'
        );

        if (previouslySelectedWallet && onboard) {
            const loadOnboardWallet = async () => {
                const walletSelected = await onboard.walletSelect(previouslySelectedWallet);

                if (walletSelected) {
                    await onboard.walletCheck();
                }
            };

            loadOnboardWallet();
        }
    }, [onboard]);
};

export default GetPreviousWallet;
