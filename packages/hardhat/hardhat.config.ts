import * as fs from "fs";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

const defaultNetwork = "localhost";

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

const infuraAPIKey: string | null = process.env.INFURA_ID;
const appAccount: string = mnemonic();

/************
 * NETWORKS *
 ************/

const networks: any = {
    localhost: {
        url: "http://localhost:8545",
    },
    rinkeby: {
        url: "https://rinkeby.infura.io/v3/" + infuraAPIKey,
        accounts: {
            mnemonic: mnemonic(),
        },
    },
    kovan: {
        url: "https://kovan.infura.io/v3/" + infuraAPIKey,
        accounts: {
            mnemonic: mnemonic(),
        },
    },
    mainnet: {
        url: "https://mainnet.infura.io/v3/" + infuraAPIKey,
        accounts: {
            mnemonic: mnemonic(),
        },
    },
    ropsten: {
        url: "https://ropsten.infura.io/v3/" + infuraAPIKey,
        accounts: {
            mnemonic: mnemonic(),
        },
    },
    goerli: {
        url: "https://goerli.infura.io/v3/" + infuraAPIKey,
        accounts: {
            mnemonic: mnemonic(),
        },
    },
    xdai: {
        url: 'https://rpc.xdaichain.com/',
        gasPrice: 1000000000,
        accounts: {
            mnemonic: mnemonic(),
        },
    },
    matic: {
        url: 'https://rpc-mainnet.maticvigil.com/',
        gasPrice: 1000000000,
        accounts: {
            mnemonic: mnemonic(),
        },
    },
}

/*************
 * COMPILERS *
 *************/
let appCompilers: any = {
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

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    defaultNetwork: defaultNetwork,
    networks: networks,
    solidity: appCompilers
};

/*********
 * TASKS *
 *********/