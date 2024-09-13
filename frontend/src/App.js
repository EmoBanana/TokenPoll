import React, { useState, useEffect } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Buffer } from "buffer";
import "./App.css";

window.Buffer = window.Buffer || Buffer;

require("@solana/wallet-adapter-react-ui/styles.css");

const NETWORK = "https://api.devnet.solana.com";

function App() {
  const wallet = useWallet();
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  async function fetchPolls() {
    // Simulate a delay and fetching data from a server or blockchain
    setTimeout(() => {
      const fetchedPolls = [
        {
          question: "Which blockchain do you prefer?",
          options: ["Solana", "Ethereum", "Polygon"],
          votes: [5, 3, 2],
        },
        {
          question: "Favorite frontend framework?",
          options: ["React", "Vue", "Angular"],
          votes: [10, 7, 1],
        },
      ];
      setPolls(fetchedPolls);
    }, 1000); // Simulating network delay
  }

  useEffect(() => {
    if (wallet.connected) {
      fetchPolls();
    }
  }, [wallet.connected]);

  async function createPoll() {
    if (!wallet.connected) {
      alert("Please connect your wallet first!");
      return;
    }

    const newPoll = {
      question,
      options: options.filter((option) => option !== ""),
      votes: new Array(options.length).fill(0),
    };

    // Simulate creating a poll by sending a small amount of SOL to yourself
    try {
      const connection = new Connection(NETWORK, "confirmed");
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 100, // 0.0000001 SOL
        })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      console.log("Transaction sent:", signature);
      console.log(
        "See transaction: https://explorer.solana.com/tx/" +
          signature +
          "?cluster=devnet"
      );

      setPolls([...polls, newPoll]);
      setQuestion("");
      setOptions(["", ""]);
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  }

  async function vote(pollIndex, optionIndex) {
    if (!wallet.connected) {
      alert("Please connect your wallet first!");
      return;
    }

    // Simulate voting by sending a small amount of SOL to yourself
    try {
      const connection = new Connection(NETWORK, "confirmed");
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 100,
        })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      console.log("Vote transaction sent:", signature);
      console.log(
        "See transaction: https://explorer.solana.com/tx/" +
          signature +
          "?cluster=devnet"
      );

      const updatedPolls = [...polls];
      updatedPolls[pollIndex].votes[optionIndex]++;
      setPolls(updatedPolls);
    } catch (error) {
      console.error("Error voting:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col">
      {/* Header with site title and wallet button */}
      <header className="flex justify-between items-center bg-blue-600 text-white px-8 py-4">
        <h1 className="text-2xl font-bold">TokenPoll</h1>
        <WalletMultiButton />
      </header>

      <div className="main-content">
        <div className="flex flex-col sm:flex-row justify-between max-w-5xl mx-auto mt-8 space-y-6 sm:space-y-0 sm:space-x-8">
          {/* Create Poll Section */}
          <div className="bg-white shadow-lg rounded-lg p-6 w-full sm:w-1/2">
            <h2 className="createPoll">Create Poll</h2>
            <input
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg mb-4 focus:outline-none"
              type="text"
              placeholder="Enter poll question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            {options.map((option, index) => (
              <input
                key={index}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg mb-2 focus:outline-none"
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
              />
            ))}
            <button
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-md mb-4 hover:bg-gray-500"
              onClick={() => setOptions([...options, ""])}
            >
              Add Option
            </button>
            <button
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-500"
              onClick={createPoll}
            >
              Create Poll
            </button>
          </div>

          {/* Active Polls Section */}
          <div className="bg-white shadow-lg rounded-lg p-6 w-full sm:w-1/2">
            <h2 className="activePoll">Active Polls</h2>
            {polls.map((poll, pollIndex) => (
              <div
                key={pollIndex}
                className="bg-gray-50 p-4 border border-gray-300 rounded-lg mb-4"
              >
                <h3 className="text-lg font-bold mb-2">{poll.question}</h3>
                {poll.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md mb-2 hover:bg-blue-500"
                    onClick={() => vote(pollIndex, optionIndex)}
                  >
                    {option} ({poll.votes[optionIndex]} votes)
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
