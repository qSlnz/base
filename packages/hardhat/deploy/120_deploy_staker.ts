import chalk from "chalk";
import { DeployFunction, DeployResult } from "hardhat-deploy/types";
import { hrtime } from "node:process";
import {
    Diamond,
    DiamondCutFacet,
    DiamondCutFacet__factory,
    IDiamondCut,
} from "../artifacts/typechain";

const func: DeployFunction = async function ({
    getNamedAccounts,
    deployments,
    ethers,
}) {
    const { deployer } = await getNamedAccounts();

    let stakerFacet: DeployResult = await deployments.deploy("StakerFacet", {
        from: deployer,
        log: true,
    });

    deployments.diamond;

    deployments.log(
        "\t\t 📄",
        chalk.cyan("StakerFacet"),
        "\n",
        "\t\t 🏠",
        chalk.magenta(stakerFacet.address),
    );

    // récupérer address du diamond
    let diamondAddress: string = await (await deployments.get("Diamond"))
        .address;

    // récupérer la liste des function de la facet
    let facetInterface = new ethers.utils.Interface(stakerFacet.abi);
    let selectorList: string[] = [];

    console.log("Start");
    for (let f in facetInterface.functions) {
        console.log(f);
        console.log(
            "> ",
            ethers.utils.Interface.getSighash(facetInterface.getFunction(f)),
        );
        selectorList.push(
            ethers.utils.Interface.getSighash(facetInterface.getFunction(f)),
        );
    }
    console.log("End");

    // Mettre la liste des facets sous la bonne forme

    // recupérer l'abi de dioamoncutfacet
    let diamondCutFacetABI = await (await deployments.get("DiamondCutFacet"))
        .abi;

    // Appeller facetCut sur le diamand avec les arg extraits

    enum FacetCutAction {
        Add,
        Replace,
        Remove,
    }

    const diamondCutParams = [
        [stakerFacet.address, FacetCutAction.Add, ["0x1f931c1c"]],
    ];

    let diamondCutNoType: unknown = new ethers.Contract(
        diamondAddress,
        diamondCutFacetABI,
    );
};

export default func;
