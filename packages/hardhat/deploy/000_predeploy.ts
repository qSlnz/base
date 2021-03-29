import chalk from 'chalk';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre) {
    console.log(chalk.bgRed("                    ") +
        chalk.bgYellow.black(" 🚀🚀 START DEPLOYMENT 🚀🚀 ") +
        chalk.bgRed("                    \n"));

    console.log(
        chalk.bgYellow.black(" 📡 DEPLOYING CONTRACTS ON BLOCKCHAIN ")
    );
    console.log(
        "\t ☀️ SELECTED BLOCKCHAIN: " + chalk.red(hre.config.defaultNetwork)
    );
};


export default func;
