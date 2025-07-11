import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import FileStorage from "./FileStorage.json";

const contractAddress = "0x9Ff9FBCCb9A9e975a364080fA5c8Dd4Db4f98fd9";

function FileUploader() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(() => localStorage.getItem("status") || "");
  const [txHash, setTxHash] = useState(() => localStorage.getItem("txHash") || "");

  useEffect(() => {
    localStorage.setItem("status", status);
  }, [status]);

  useEffect(() => {
    localStorage.setItem("txHash", txHash);
  }, [txHash]);


  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia Testnet",
              rpcUrls: ["https://rpc.sepolia.org"],
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        console.error("Switch chain error:", switchError);
      }
    }
  };

  useEffect(() => {
    switchToSepolia();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setStatus("Uploading to IPFS via Pinata...");
    setTxHash("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxContentLength: "Infinity",
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET,
          },
        }
      );

      const ipfsHash = res.data.IpfsHash;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      setStatus(`Stored on IPFS: ${ipfsUrl}`);

      await storeOnBlockchain(ipfsUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus("❌ Upload failed");
    }
  };

  const storeOnBlockchain = async (ipfsUrl) => {
    try {
      setStatus("Storing IPFS URL on blockchain...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, FileStorage.abi, signer);

      const tx = await contract.storeFileHash(ipfsUrl);
      setTxHash(tx.hash);
      await tx.wait();

      setStatus("✅ Stored IPFS URL on-chain!");
    } catch (error) {
      console.error(error);
      setStatus("❌ Failed to store on blockchain");
    }
  };

  const clearLocalData = () => {
    setStatus("");
    setTxHash("");
    localStorage.removeItem("status");
    localStorage.removeItem("txHash");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload File to IPFS using Pinata</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload & Store</button>
      <p>{status}</p>

      {txHash && (
        <p>
          🔗 View on Etherscan:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}

      {(status || txHash) && (
        <button
          onClick={clearLocalData}
          style={{
            marginTop: "10px",
            background: "crimson",
            color: "white",
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🔄 Clear Stored Info
        </button>
      )}
    </div>
  );
}

export default FileUploader;

