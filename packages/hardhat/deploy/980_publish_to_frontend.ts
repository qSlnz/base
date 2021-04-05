import chalk from 'chalk';
import { DeployFunction, Deployment, DeployResult } from 'hardhat-deploy/types';
import { copyFile, existsSync, mkdirSync, writeFileSync } from 'fs';
import { frontEndPathConfig } from '../hardhat.config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { copySync } from 'fs-extra';

const buildContractsUniqueAccessPointFile = async (contractNameList: string[]) => {
    // build import
    let contractsFile = "import { ethers } from 'ethers';\nimport { ";

    contractNameList.forEach((contractName) => {
        contractsFile += contractName + "Data, ";
    });

    contractsFile += " } from '.';\nimport { ";

    contractNameList.forEach((contractName) => {
        contractsFile += contractName + ", ";
    });

    contractsFile += " } from './typechain';\n\n";

    // build interface
    contractsFile += "interface IContractList {";
    contractNameList.forEach((contractName) => {
        ["Reader", "Writer"].forEach((option) => {
            contractsFile += `\n\t${contractName}${option}: ${contractName},`;
        })
    });

    contractsFile += "\n};\n\n";

    // build contracts variable
    contractsFile += "const contracts: IContractList = {";

    contractNameList.forEach((contractName) => {
        ["Reader", "Writer"].forEach((option) => {
            contractsFile += `\n\t${contractName}${option}: new ethers.Contract(${contractName}Data.address, ${contractName}Data.abi) as ${contractName},`;

        })
    });

    contractsFile += "\n};\n\n";

    // build connectAllContracts function
    [["Reader", "Provider"], ["Writer", "Signer"]].forEach((option) => {
        contractsFile += `const connectAllContracts${option[0]} = (${option[1]}: ethers.providers.JsonRpc${option[1]}) => {`;

        contractNameList.forEach((contractName) => {
            contractsFile += `\n\tcontracts.${contractName}${option[0]} = contracts.${contractName}${option[0]}.connect(${option[1]});`
        });

        contractsFile += "\n};\n\n";
        contractsFile += `export { connectAllContracts${option[0]} };\n\n`;
    });

    // default export
    contractsFile += "export default contracts;";
    writeFileSync(`${frontEndPathConfig["react"]}/Contracts.ts`, contractsFile);
};

// publish address & abi in one ts file and export it to react frontend
const publishDeploymentInformation = async (hre: HardhatRuntimeEnvironment, contractName: string): Promise<boolean> => {
    hre.deployments.log(
        "\t 🚢",
        chalk.yellow("PUBLISH"),
        "(abi, address)",
        chalk.cyan(contractName)
    );

    let contractInformation: Deployment = await hre.deployments.get(contractName);

    let toExportData = "const " + contractName + "Data={address:" + JSON.stringify(contractInformation.address) + ",abi:'" + JSON.stringify(contractInformation.abi) + "'};export default " + contractName + "Data;";

    writeFileSync(`${frontEndPathConfig["react"]}/${contractName}.data.ts`, toExportData);

    return true;
};

function buildNetworkInformationFile(hre: HardhatRuntimeEnvironment) {
    hre.deployments.log(
        "\t 🚢",
        chalk.yellow("PUBLISH"),
        "network information"
    );

    let networkInformationFile = "";

    networkInformationFile += `let deployedNetwork = {\n\tchainId: ${hre.network.config.chainId},\n\tname: "${hre.network.name}"\n}`;
    networkInformationFile += "\n\nexport default deployedNetwork;"

    writeFileSync(`${frontEndPathConfig["react"]}/network.data.ts`, networkInformationFile);
}


const func: DeployFunction = async function (hre) {
    hre.deployments.log(
        chalk.bgYellow.black("\n\n 🌊 PUBLISHING TO FRONTENDS ")
    );

    for (let key in frontEndPathConfig) {
        hre.deployments.log(
            "\t 🚗 " + key.toUpperCase() + " PATH:",
            chalk.blue(frontEndPathConfig[key])
        );

        if (!existsSync(frontEndPathConfig[key])) {
            mkdirSync(frontEndPathConfig[key]);
        }
    }

    let contractsList: string[] = [];
    for (let contractName in await hre.deployments.all()) {
        contractsList.push(contractName);
    }

    let indexFile = "";

    // copy abi/address of deployed contracts
    contractsList.forEach((contractName) => {
        publishDeploymentInformation(hre, contractName);

        // build index.ts file to easily access data
        indexFile += "export { default as " + contractName + "Data " + " } from './" + contractName + ".data" + "';\n";
    });

    indexFile += "export { default as contracts } from './Contracts';\n";

    // build contracts object that unify all deployed contracts
    buildContractsUniqueAccessPointFile(contractsList);

    // build information about network
    buildNetworkInformationFile(hre);
    indexFile += 'export { default as deployedNetwork } from "./network.data";\n';

    writeFileSync(`${frontEndPathConfig["react"]}/index.ts`, indexFile);

    hre.deployments.log(
        "\t 🚢",
        chalk.yellow("PUBLISH"),
        "typechained contracts"
    );

    // copy typechained artifacts of deployed contract
    copySync("artifacts/typechain", `${frontEndPathConfig["react"]}/typechain`);
};

export default func;
