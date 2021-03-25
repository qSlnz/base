import { deployments, ethers } from "hardhat";
import { ExampleExternalContract } from "../artifacts/typechain";
import { use, expect } from "chai";

describe('Premier Test', () => {
    describe('On teste le déploiement ou bien', () => {
        it('Déploiement de la mort', async () => {
            const a = await deployments.fixture(["ExampleExternalContract"]);
            console.log(a);
            // const signers = await ethers.getSigners();

            // const ExampleExternalContractFactory = await ethers.getContractFactory(
            //     "ExampleExternalContract",
            //     signers[0]
            // );

            // let contract = (await ExampleExternalContractFactory.deploy()) as ExampleExternalContract;

            // await contract.deployed();

            // expect(contract.address).to.properAddress;
        });
    });
});