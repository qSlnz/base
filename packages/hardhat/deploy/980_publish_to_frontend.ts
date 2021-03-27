import chalk from 'chalk';
import { DeployFunction, Deployment, DeployResult } from 'hardhat-deploy/types';
import { existsSync, mkdirSync } from 'fs';
import { frontEndPathConfig } from '../hardhat.config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const publishDeploymentInformation = async (hre: HardhatRuntimeEnvironment, contractName: string): Promise<boolean> => {
    console.log(
        "\t 🚢",
        chalk.yellow("PUBLISHING"),
        chalk.cyan(contractName)
    );

    let contractInformation: Deployment = await hre.deployments.get(contractName);

    console.log(contractInformation.address);

    return true;
};

const func: DeployFunction = async function (hre) {
    console.log(
        chalk.bgYellow.black("\n\n 🌊 PUBLISH TO FRONTENDS ")
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

    for (let contractName in await hre.deployments.all()) {
        publishDeploymentInformation(hre, contractName);
    }

};

export default func;
