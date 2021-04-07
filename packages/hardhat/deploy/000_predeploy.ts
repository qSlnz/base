import chalk from 'chalk';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

const func: DeployFunction = async function ({ deployments, config }) {
    deployments.log(chalk.bgRed("                    ") +
        chalk.bgYellow.black(" 🚀🚀 START DEPLOYMENT 🚀🚀 ") +
        chalk.bgRed("                    \n"));

    deployments.log(
        chalk.bgYellow.black(" 📡 DEPLOYING CONTRACTS ON BLOCKCHAIN ")
    );

    deployments.log(
        "\t ☀️ SELECTED BLOCKCHAIN: " + chalk.red(config.defaultNetwork)
    );
};


export default func;
