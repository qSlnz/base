
import { ethers } from "ethers";
import { deployedNetwork } from "./contracts";
import { connectAllContractsReader } from "./contracts/Contracts";
import { NETWORKS } from "./networks";


/*****************
 * MUST BE SET *
 *****************/

// Network (i.e blockchain) where the application contracts are running
// Set manually to avoid mistake
const appNetwork = NETWORKS.localhost;

// security check the correspondance with the last hardhat deployed network
if (appNetwork.chainId !== deployedNetwork.chainId || appNetwork.name !== deployedNetwork.name) {
    throw "Inconsistent networks information. Deployed contracts network and app contracts are differents.";
}

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
const INFURA_API_KEY = "c6620abc4b344c1d97d7205817a290ce";
//export const mainnetProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_API_KEY);
const mainnetProvider = new ethers.providers.InfuraProvider("mainnet", INFURA_API_KEY);

// Provider linked to appnet
const localProvider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(appNetwork.rpcUrl);
connectAllContractsReader(localProvider);

export { appNetwork, mainnetProvider, localProvider };