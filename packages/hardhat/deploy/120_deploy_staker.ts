import chalk from "chalk";
import { BytesLike } from "ethers";
import { DeployFunction, DeployResult } from "hardhat-deploy/types";
import { IDiamondCut } from "../artifacts/typechain";

const func: DeployFunction = async function ({
    getNamedAccounts,
    deployments,
    ethers,
}) {
    const { deployer } = await getNamedAccounts();

    let stakerFacet: DeployResult = await deployments.deploy("Staker", {
        from: deployer,
        log: true,
    });

    deployments.log(
        "\t\t 📄",
        chalk.cyan("StakerFacet"),
        "\n",
        "\t\t 🏠",
        chalk.magenta(stakerFacet.address),
    );

    // récupérer address du diamond
    let diamondAddress: string = await (
        await ethers.getContract("Diamond", deployer)
    ).address;

    // récupérer la liste des selecteurs de la facet
    let facetInterface = new ethers.utils.Interface(stakerFacet.abi);
    let selectorList: BytesLike[] = [];

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
        {
            facetAddress: stakerFacet.address,
            action: FacetCutAction.Add,
            functionSelectors: selectorList,
        },
    ];

    const diamondContract = await ethers.getContract("Diamond", deployer);

    const diamondCutContract = await ethers.getContract(
        "DiamondCutFacet",
        deployer,
    );
    const diamondCutContractCo = (diamondCutContract.attach(
        diamondAddress,
    ) as unknown) as IDiamondCut;
    console.log(diamondAddress);
    console.log(deployer);

    let t = "0x";
    for (let i = 0; i < 100; i++) {
        if (ethers.utils.isAddress(t)) {
            break;
        }

        t += "0";
    }

    try {
        await diamondCutContractCo.diamondCut(
            diamondCutParams,
            t,
            ethers.utils.toUtf8Bytes(""),
        );
    } catch (e) {
        console.log(e);
    }
};

export default func;
