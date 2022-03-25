import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import abi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x51Ebc569ED8AdE726A8f16f82534772ac34d4938";
  const [text, setText] = useState("");

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask installed");
      } else {
        console.log("WE HAVE THE ETHEREUM OBJECT", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      console.log({ accounts });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected to MetaMask!", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const wave = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalConnect = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalConnect.getTotalWaves();
        console.log("Retrieved total waves:", count.toNumber());

        const waveTxn = await wavePortalConnect.wave(text, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined --- ", waveTxn.hash);

        count = await wavePortalConnect.getTotalWaves();
        console.log("Retrieved total waves...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exisit");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalConnect = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalConnect.getAllWaves();

        let wavesCleaned = [];

        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exisit");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevWaves) => [
        ...prevWaves,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          I am farza and I worked on self-driving cars so that's pretty cool right? Connect your
          Ethereum wallet and wave at me!
        </div>

        <form
          onSubmit={wave}
          style={{ marginTop: "20px", width: "100%", height: "100%", display: "block" }}
        >
          <div style={{ width: "100%", display: "block" }}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              name="text"
              style={{ width: "100%", padding: "10px", display: "block" }}
            />
          </div>

          <button style={{ width: "100%" }} className="waveButton">
            Wave at Me
          </button>
        </form>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}
            >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp?.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
