import chalk from 'chalk';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre) {
    console.log(chalk.bgRed("\n                    ") +
        chalk.bgYellow.black(" 🌘🌘  END DEPLOYMENT  🌘🌘 ") +
        chalk.bgRed("                    "));
};


export default func;
