import chalk from 'chalk';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

const func: DeployFunction = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();


    let Staker: DeployResult = await deployments.deploy('Staker', {
        from: deployer,
        log: true
    });

    deployments.log(
        "\t\t 📄",
        chalk.cyan("Staker"),
        "\n",
        "\t\t 🏠",
        chalk.magenta(Staker.address),
    );
};

export default func;
