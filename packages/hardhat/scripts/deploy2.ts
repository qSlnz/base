import { ethers } from "hardhat";
import chalk from "chalk";

async function main() {
    console.log(
        "\n\n 📡",
        chalk.bgYellow.black("Deploying contracts")
    );

    const ExampleExternalContract = await deploy("ExampleExternalContract");
    const Staker = await deploy("Staker", [ExampleExternalContract.address]);
};

async function deploy(contractName: string, _args: any[] = [], overrides: {} = {}, libraries: {} = {}) {
    console.log("\t 🛰",
        chalk.yellow("Deploying: "),
        `${contractName}`
    );

    const contractArgs = _args || [];
    const contractArtifacts = await ethers.getContractFactory(contractName, { libraries: libraries });
    const deployed = await contractArtifacts.deploy(...contractArgs, overrides);

    console.log(
        "\t\t 📄",
        chalk.cyan(contractName),
        "\n",
        "\t\t 🏠",
        chalk.magenta(deployed.address),
    );

    return deployed;
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


// import { ethers } from "hardhat"
// import { utils } from "ethers";
// import { writeFileSync } from "fs";
// import chalk from "chalk";
// import * as R from "ramda";


// /*
//     Script de déploiement des contracts selectionnés sur le defaultNetwork selectionné
// */

// const main = async () => {
//     /***************
//      * DÉPLOIEMENT *
//      ***************/
//     console.log(
//         "\n\n 📡",
//         chalk.bgYellow.black("Deploying contracts")
//     );

//     const exampleExternalContract = await deploy("ExampleExternalContract");
//     const stakerContract = await deploy("Staker", [exampleExternalContract.address]);

//     console.log(
//         "\t 💾",
//         chalk.yellow("Artifacts"),
//         "(address, abi, and args) saved to:",
//         "\n\t\t 🚗",
//         chalk.blue("packages/hardhat/artifacts/")
//     );
// };

// const deploy = async (contractName: string, _args: any[] = [], overrides: {} = {}, libraries: {} = {}) => {
//     console.log("\t 🛰",
//         chalk.yellow("Deploying: "),
//         `${contractName}`
//     );

//     const contractArgs = _args || [];
//     const contractArtifacts = await ethers.getContractFactory(contractName, { libraries: libraries });
//     const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
//     const encoded = abiEncodeArgs(deployed, contractArgs);

//     writeFileSync(`artifacts/${contractName}.address`, deployed.address);

//     console.log(
//         "\t\t 📄",
//         chalk.cyan(contractName),
//         "\n",
//         "\t\t 🏠",
//         chalk.magenta(deployed.address),
//     );

//     if (!encoded || encoded.length <= 2) return deployed;
//     writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));
// };

// // abi encodes contract arguments
// // useful when you want to manually verify the contracts
// // for example, on Etherscan
// const abiEncodeArgs = (deployed, contractArgs): string => {
//     // not writing abi encoded args if this does not pass
//     if (
//         !contractArgs ||
//         !deployed ||
//         !R.hasPath(['a', 'b'], deployed)
//     ) {
//         return "";
//     }

//     const encoded = utils.defaultAbiCoder.encode(
//         deployed.interface.deploy.inputs,
//         contractArgs
//     );

//     return encoded;
// };

// // check if the file is a Solidity file
// const isSolidity = (fileName: string): boolean => {
//     return fileName.indexOf(".sol") >= 0 && fileName.indexOf(".swp") < 0 && fileName.indexOf(".swap") < 0;
// };

// main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.error(error);
//         process.exit(1);
//     });
