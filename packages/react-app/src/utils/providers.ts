
import { ethers } from "ethers";
import { appNetwork, INFURA_API_KEY } from "../Constants";
import { connectAllContractsReader } from "./contracts/Contracts";

// We got 3 objects connected to the blockchain
// - mainnetProvider that is connected to the mainnet, so we can retrieve information that are only available on L1 like ENS protocol
// - localProvider that is connected to the app blockchain to READ informations
// - userSigner that is defined later and is connected to the app blockchain to WRITE information (i.e make transactions)
//
// localProvider & userSigner are connected to ours own contracts via connectAllContractsReader connectAllContractsWrite
// So we can easily connectre and read and write contracts while enjoying a full typed environment
// You can use them using the global 'contracts' object that contains all necessary connexion
// example1 : contracts.StakerReader.pools(poolId) to get all information about the pool poolId
// example2 : 
//export const mainnetProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_API_KEY);
const mainnetProvider = new ethers.providers.InfuraProvider("mainnet", INFURA_API_KEY);

// Provider linked to appnet
const localProvider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(appNetwork.rpcUrl);
connectAllContractsReader(localProvider);

export { mainnetProvider, localProvider };