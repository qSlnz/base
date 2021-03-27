import chalk from 'chalk';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre) {
    console.log(chalk.bgRed("                    ") +
        chalk.bgYellow.black(" 🚀🚀 START DEPLOYMENT 🚀🚀 ") +
        chalk.bgRed("                    \n"));
};


export default func;
