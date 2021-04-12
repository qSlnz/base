import chalk from "chalk";
import { ethers } from "hardhat";
import { DeployFunction, DeployResult } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
    getNamedAccounts,
    deployments,
}) {
    const { deployer } = await getNamedAccounts();

    const FacetCutAction = {
        Add: 0,
        Replace: 1,
        Remove: 2,
    };

    let diamondCutFacet: DeployResult = await deployments.deploy(
        "DiamondCutFacet",
        {
            from: deployer,
            log: true,
        },
    );

    deployments.log(
        "\t\t 📄",
        chalk.cyan("DiamondCutFacet"),
        "\n",
        "\t\t 🏠",
        chalk.magenta(diamondCutFacet.address),
    );

    const diamondCutParams = [
        [diamondCutFacet.address, FacetCutAction.Add, ["0x1f931c1c"]],
    ];

    console.log(deployer);

    let Diamond: DeployResult = await deployments.deploy("Diamond", {
        from: deployer,
        args: [diamondCutParams, { owner: deployer }],
        log: true,
    });

    deployments.log(
        "\t\t 📄",
        chalk.cyan("Diamond with his DiamondCutFacet"),
        "\n",
        "\t\t 🏠",
        chalk.magenta(Diamond.address),
    );
};

export default func;
