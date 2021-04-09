import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/ethers-v5";
import 'hardhat-deploy';
import "hardhat-deploy-ethers";

import { HardhatUserConfig, NetworksUserConfig, SolidityUserConfig } from "hardhat/types";

import * as fs from "fs";
import * as dotenv from "dotenv";


/* Handle .env variables in the root of hardhat folder */
dotenv.config();

/*****************
 * SHOULD BE SET *
 *****************/

// Network use on deploiement
const defaultNetwork = "hardhat";

// Infura ID key if infura provider is use
const INFURA_API_KEY = process.env.INFURA_ID;

/***********
 * ACCOUNT *
 ***********/

let mnemonic = (): string => {
    try {
        return fs.readFileSync("./mnemonic.txt").toString().trim();
    } catch (e) {
        // @ts-ignore
        if (defaultNetwork !== "localhost" && defaultNetwork !== "hardhat") {
            console.log("☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.")
        }
    }

    return "";
};

const masterAppAccount: string = mnemonic();

const namedAccounts = {
    deployer: 0,
    proxyOwner: 1,
    admin: '0x5B9d721f482E60efA99e555Cb59c7DBF4Df15Dc7',
};

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
    mumbai: {
        chainId: 80001,
        gasPrice: 1000000000,
        url: "https://rpc-mumbai.maticvigil.com/",
        accounts: {
            mnemonic: masterAppAccount,
        }
    }
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
        {
            version: "0.8.3",
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
    namedAccounts: namedAccounts,
    solidity: appCompilers,
    typechain: {
        outDir: "artifacts/typechain",
        target: "ethers-v5"
    },
    mocha: {
        timeout: 2000
    },
    paths: {
        artifacts: "artifacts",
        sources: "contracts",
        tests: "test",
        cache: "cache",
        deploy: "deploy",
        deployments: "deployments"
    }
};

const frontEndPathConfig: { [key: string]: string } = {
    react: "../react-app/src/utils/contracts",
    subgraph: "../subgraph/contracts"
};

export { frontEndPathConfig };
export default config;

// module.exports = config;

/*********
 * TASKS *
 *********/