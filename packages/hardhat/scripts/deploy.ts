import { ethers } from "hardhat"
import { utils } from "ethers";
import { writeFileSync } from "fs";
import chalk from "chalk";
const R = require("ramda");

const main = async () => {
    /***************
     * DÉPLOIEMENT *
     ***************/
    console.log("\n\n 📡 Deploying...\n");

    const exampleExternalContract = await deploy("ExampleExternalContract");
    const stakerContract = await deploy("Staker", [exampleExternalContract.address]);

    console.log(
        " 💾  Artifacts (address, abi, and args) saved to: ",
        chalk.blue("packages/hardhat/artifacts/"),
        "\n\n"
    );
};

const deploy = async (contractName: string, _args: any[] = [], overrides: {} = {}, libraries: {} = {}) => {
    console.log(` 🛰  Deploying: ${contractName}`);

    const contractArgs = _args || [];
    const contractArtifacts = await ethers.getContractFactory(contractName, { libraries: libraries });
    const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
    const encoded = abiEncodeArgs(deployed, contractArgs);

    writeFileSync(`artifacts/${contractName}.address`, deployed.address);

    console.log(
        " 📄",
        chalk.cyan(contractName),
        "deployed to:",
        chalk.magenta(deployed.address),
    );

    if (!encoded || encoded.length <= 2) return deployed;
    writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));
};

// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan
const abiEncodeArgs = (deployed, contractArgs): string => {
    // not writing abi encoded args if this does not pass
    if (
        !contractArgs ||
        !deployed ||
        !R.hasPath(['a', 'b'], deployed)
    ) {
        return "";
    }

    const encoded = utils.defaultAbiCoder.encode(
        deployed.interface.deploy.inputs,
        contractArgs
    );

    return encoded;
};

// check if the file is a Solidity file
const isSolidity = (fileName: string): boolean => {
    return fileName.indexOf(".sol") >= 0 && fileName.indexOf(".swp") < 0 && fileName.indexOf(".swap") < 0;
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
