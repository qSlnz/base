import chalk from 'chalk';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

const func: DeployFunction = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts();

    const ExampleExternalContractAddress = (await deployments.get("ExampleExternalContract")).address;

    let Staker: DeployResult = await deployments.deploy('Staker', {
        from: deployer,
        proxy: true,
        args: [ExampleExternalContractAddress],
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
