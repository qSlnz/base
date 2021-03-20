import chalk from "chalk";
import * as fs from "fs";
import * as hre from "hardhat";


const publishDir = "../react-app/src/contracts";
const graphDir = "../subgraph"

let publishContract = (contractName: string): boolean => {
    console.log(
        "\t 🛥",
        chalk.yellow("Publishing"),
        chalk.cyan(contractName)
    );

    try {
        let contract = fs.
            readFileSync(`${hre.config.paths.artifacts}/contracts/${contractName}.sol/${contractName}.json`)
            .toString();
        const address = fs
            .readFileSync(`${hre.config.paths.artifacts}/${contractName}.address`)
            .toString();

        let contractJSON = JSON.parse(contract);

        let graphConfigPath = `${graphDir}/config/config.json`;
        let graphConfig: string;

        try {
            if (fs.existsSync(graphConfigPath)) {
                graphConfig = fs
                    .readFileSync(graphConfigPath)
                    .toString();
            } else {
                graphConfig = '{}';
            }
        } catch (e) {
            console.log(e);
        }

        graphConfig = JSON.parse(graphConfig);
        graphConfig[contractName + "Address"] = address;

        fs.writeFileSync(
            `${publishDir}/${contractName}.address.js`,
            `module.exports = "${address}";`
        );
        fs.writeFileSync(
            `${publishDir}/${contractName}.abi.js`,
            `module.exports = ${JSON.stringify(contractJSON.abi, null, 2)};`
        );
        fs.writeFileSync(
            `${publishDir}/${contractName}.bytecode.js`,
            `module.exports = "${contractJSON.bytecode}";`
        );

        const folderPath = graphConfigPath.replace("/config.json", "");

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        fs.writeFileSync(
            graphConfigPath,
            JSON.stringify(graphConfig, null, 2)
        );
        fs.writeFileSync(
            `${graphDir}/abis/${contractName}.json`,
            JSON.stringify(contractJSON.abi, null, 2)
        );

        console.log("\t\t ✔️",
            "frontend"
        );
        console.log("\t\t ✔️",
            "subgraph"
        );

        return true;
    } catch (e) {
        console.log(e);
        if (e.toString().indexOf("no such file or directory") >= 0) {
            console.log(chalk.yellow(" ⚠️  Can't publish " + contractName + " yet (make sure it getting deployed)."))
        } else {
            console.log(e);
            return false;
        }
    }
};


async function main() {
    console.log(
        "\n\n 🌊",
        chalk.bgYellow.black("Publishing to frontend & subgraph"),
        "\n\t 🚗 frontend path:",
        chalk.blue(publishDir),
        "\n\t 🚗 subgraph path:",
        chalk.blue(graphDir),
    );

    if (!fs.existsSync(publishDir)) {
        fs.mkdirSync(publishDir);
    }
    const finalContractList = [];
    fs.readdirSync(hre.config.paths.sources).forEach((file) => {
        if (file.indexOf(".sol") >= 0) {
            const contractName = file.replace(".sol", "");
            // Add contract to list if publishing is successful
            if (publishContract(contractName)) {
                finalContractList.push(contractName);
            }
        }
    });
    fs.writeFileSync(
        `${publishDir}/contracts.js`,
        `module.exports = ${JSON.stringify(finalContractList)};`
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
