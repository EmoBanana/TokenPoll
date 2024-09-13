// src/PollComponent.js
import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { Buffer } from "buffer";
import BN from "bn.js";
import idl from "./poll_idl.json"; // Adjust path if needed
import Modal from "react-modal"; // Add a modal library like react-modal

// Define your program ID here
const POLL_PROGRAM_ID = "6ooW7oEFrPzNayKVd4qYzVMKickuA8N1r6rFcy44J4Fj"; // Replace with your actual program ID

const connection = new Connection("https://api.devnet.solana.com");

const PollComponent = () => {
  const { publicKey, sendTransaction, connected, disconnect } = useWallet();

  // States for poll creation
  const [pollQuestion, setPollQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]); // 2 initial options
  const [newOption, setNewOption] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // States for available polls and voting
  const [polls, setPolls] = useState([]); // Array of polls fetched from the blockchain
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [amount, setAmount] = useState(0);
  const [voteOption, setVoteOption] = useState(0);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const createPoll = async () => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first.");
      return;
    }

    if (options.length < 2) {
      alert("You need at least 2 options.");
      return;
    }

    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction: (tx) => sendTransaction(tx, connection) }, // Ensure signTransaction is correct
      { preflightCommitment: "processed" }
    );

    const program = new Program(idl, POLL_PROGRAM_ID, provider);

    try {
      // Derive a PDA (Program Derived Address) for the poll using Buffer
      const [pollPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("poll"), publicKey.toBuffer()],
        program.programId
      );

      // Generate a unique poll ID
      const pollId = new BN(Date.now()); // Use current timestamp for uniqueness

      // Create the poll with the question and options
      await program.rpc.initialize(pollId, {
        accounts: {
          poll: pollPDA, // Use the derived PDA for the poll
          owner: publicKey,
          systemProgram: SystemProgram.programId, // Ensure system program is passed correctly
        },
      });

      alert("Poll created successfully.");
      setModalIsOpen(false);
      // Optionally, fetch the updated list of polls here
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Error creating poll: " + error.message);
    }
  };

  const stakeTokens = async () => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first.");
      return;
    }

    const transaction = new Transaction()
      .add
      // Add staking instructions here
      ();
    await sendTransaction(transaction, connection);
  };

  const vote = async () => {
    if (!connected || !publicKey || selectedPoll === null) {
      alert("Please connect your wallet and select a poll first.");
      return;
    }

    const transaction = new Transaction()
      .add
      // Add voting instructions here
      ();
    await sendTransaction(transaction, connection);
  };

  return (
    <div>
      <WalletMultiButton />
      {connected && (
        <div>
          <h2>Create Poll</h2>
          <button onClick={() => setModalIsOpen(true)}>
            Open Poll Creation Modal
          </button>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
          >
            <h2>Create Poll</h2>
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Poll Question"
            />
            {options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
            ))}
            <button onClick={addOption}>Add Option</button>
            <button onClick={createPoll}>Create Poll</button>
            <button onClick={() => setModalIsOpen(false)}>Close</button>
          </Modal>

          <h2>Available Polls</h2>
          {/* Render available polls */}
          {polls.map((poll, index) => (
            <div key={index}>
              <h3>{poll.question}</h3>
              {poll.options.map((option, i) => (
                <button key={i} onClick={() => setVoteOption(i)}>
                  Vote for {option}
                </button>
              ))}
              <button onClick={() => setSelectedPoll(poll)}>Select Poll</button>
            </div>
          ))}

          {selectedPoll && (
            <div>
              <h2>Vote</h2>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to Stake"
              />
              <button onClick={stakeTokens}>Stake Tokens</button>
              <button onClick={vote}>Vote</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PollComponent;
