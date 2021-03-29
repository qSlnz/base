import chalk from 'chalk';
import { DeployFunction, Deployment, DeployResult } from 'hardhat-deploy/types';
import { copyFile, existsSync, mkdirSync, writeFileSync } from 'fs';
import { frontEndPathConfig } from '../hardhat.config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { copySync } from 'fs-extra';

const publishDeploymentInformation = async (hre: HardhatRuntimeEnvironment, contractName: string): Promise<boolean> => {
    console.log(
        "\t 🚢",
        chalk.yellow("PUBLISH"),
        "(abi, address)",
        chalk.cyan(contractName)
    );

    let contractInformation: Deployment = await hre.deployments.get(contractName);

    let toExportABIVariableName = contractName + "_ABI";
    let toExportABI = "const " + toExportABIVariableName + " = " + JSON.stringify(contractInformation.abi) + "; export default " + toExportABIVariableName + ";";
    let toExportAddressVariableName = contractName + "_ADDRESS";
    let toExportAddress = "const " + toExportAddressVariableName + " = " + JSON.stringify(contractInformation.address) + "; export default " + toExportAddressVariableName + ";";

    writeFileSync(`${frontEndPathConfig["react"]}/${contractName}.abi.ts`, toExportABI);
    writeFileSync(`${frontEndPathConfig["react"]}/${contractName}.address.ts`, toExportAddress);

    return true;
};

const func: DeployFunction = async function (hre) {
    console.log(
        chalk.bgYellow.black("\n\n 🌊 PUBLISHING TO FRONTENDS ")
    );

    for (let key in frontEndPathConfig) {
        console.log(
            "\t 🚗 " + key.toUpperCase() + " PATH:",
            chalk.blue(frontEndPathConfig[key])
        );

        if (!existsSync(frontEndPathConfig[key])) {
            mkdirSync(frontEndPathConfig[key]);
        }
    }

    let indexFile = "";

    // copy abi/address of deployed contracts
    for (let contractName in await hre.deployments.all()) {
        publishDeploymentInformation(hre, contractName);

        indexFile = indexFile + "export { default as " + contractName + "_ADDRESS " + " } from './" + contractName + ".address" + "';";
    }

    //writeFileSync(`${frontEndPathConfig["react"]}/index.ts`, indexFile);

    console.log(
        "\t 🚢",
        chalk.yellow("PUBLISHING"),
        "typechained contracts"
    );

    // copy typechained artifacts of deployed contract
    copySync("artifacts/typechain", `${frontEndPathConfig["react"]}/typechain`);
};

export default func;
