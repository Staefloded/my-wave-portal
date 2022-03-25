const hre = require("hardhat");

const main = async () => {
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await waveContract.deployed();
  console.log("Contract deployed to:", waveContract.address);

  let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);

  console.log("Contract Balance:", hre.ethers.utils.formatEther(contractBalance));

  let waveTxn = await waveContract.wave("A message!");
  await waveTxn.wait();

  let waveTxn2 = await waveContract.wave("A second message!");
  await waveTxn2.wait();

  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log("Contract Balance:", hre.ethers.utils.formatEther(contractBalance));

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

runMain();
