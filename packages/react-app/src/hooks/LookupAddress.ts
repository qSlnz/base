import { useState, useEffect } from "react";
import { getAddress } from "@ethersproject/address";
import { ethers } from "ethers";
import { useLocalStorage } from ".";


const lookupAddress = async (provider: ethers.providers.JsonRpcProvider, address: string) => {
    try {
        // Accuracy of reverse resolution is not enforced.
        // We then manually ensure that the reported ens name resolves to address
        const reportedName = await provider.lookupAddress(address);
        const resolvedAddress = await provider.resolveName(reportedName);
        if (getAddress(address) === getAddress(resolvedAddress)) {
            return reportedName;
        }
    } catch (e) {
        // Do nothing
    }
    return "";
};

const useLookupAddress = (provider: ethers.providers.JsonRpcProvider, address: string) => {
    const [ensName, setEnsName] = useState(address);

    useEffect(() => {
        if (provider) {
            lookupAddress(provider, address).then((name) => {
                setEnsName(name)
            });
        }
    }, [address]);

    return ensName;
};

export default useLookupAddress;
