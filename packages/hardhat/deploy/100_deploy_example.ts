import chalk from 'chalk';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

const func: DeployFunction = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();

    let ExampleExternalContract: DeployResult = await deployments.deploy('ExampleExternalContract', {
        from: deployer,
        log: true
    });

    deployments.log(
        "\t\t 📄",
        chalk.cyan("ExampleExternalContract"),
        "\n",
        "\t\t 🏠",
        chalk.magenta(ExampleExternalContract.address),
    );
};


export default func;
