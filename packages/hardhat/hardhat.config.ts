import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/ethers-v5";

import { HardhatUserConfig, NetworksUserConfig, SolidityUserConfig } from "hardhat/types";

import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

/*****************
 * SHOULD BE SET *
 *****************/

// Network use on deploiement
const defaultNetwork = "localhost";

// Infura ID key if infura provider is use
const INFURA_API_KEY = process.env.INFURA_ID;

/***********
 * ACCOUNT *
 ***********/

let mnemonic = (): string => {
    try {
        return fs.readFileSync("./mnemonic.txt").toString().trim();
    } catch (e) {
        if (defaultNetwork !== "localhost") {
            console.log("☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.")
        }
    }

    return "";
};

const masterAppAccount: string = mnemonic();

/************
 * NETWORKS *
 ************/

const networks: NetworksUserConfig = {
    localhost: {
        url: "http://localhost:8545",
    },
    rinkeby: {
        url: "https://rinkeby.infura.io/v3/" + INFURA_API_KEY,
        accounts: {
            mnemonic: masterAppAccount,
        },
    },
    kovan: {
        url: "https://kovan.infura.io/v3/" + INFURA_API_KEY,
        accounts: {
            mnemonic: masterAppAccount,
        },
    },
    mainnet: {
        url: "https://mainnet.infura.io/v3/" + INFURA_API_KEY,
        accounts: {
            mnemonic: masterAppAccount,
        },
    },
    ropsten: {
        url: "https://ropsten.infura.io/v3/" + INFURA_API_KEY,
        accounts: {
            mnemonic: masterAppAccount,
        },
    },
    goerli: {
        url: "https://goerli.infura.io/v3/" + INFURA_API_KEY,
        accounts: {
            mnemonic: masterAppAccount,
        },
    },
    xdai: {
        url: 'https://rpc.xdaichain.com/',
        gasPrice: 1000000000,
        accounts: {
            mnemonic: masterAppAccount,
        },
    },
    matic: {
        url: 'https://rpc-mainnet.maticvigil.com/',
        gasPrice: 1000000000,
        accounts: {
            mnemonic: masterAppAccount,
        },
    },
}

/*************
 * COMPILERS *
 *************/
let appCompilers: SolidityUserConfig = {
    compilers: [
        {
            version: "0.5.5",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        },
        {
            version: "0.6.7",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        },
        {
            version: "0.7.4",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        },
    ]
}

/**********
 * EXPORT *
 **********/

const config: HardhatUserConfig = {
    defaultNetwork: defaultNetwork,
    networks: networks,
    solidity: appCompilers,
    typechain: {
        outDir: "artifacts/typechain",
        target: "ethers-v5"
    }
};

export default config;

/*********
 * TASKS *
 *********/