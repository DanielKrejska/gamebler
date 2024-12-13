import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function DiceGame() {
    const [message, setMessage] = useState("");
    const [balance, setBalance] = useState(0);
    const navigate = useNavigate();

    const getBalance = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5001/home", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            if (!response.ok) {
                setMessage(data.message);
            } else {
                setBalance(data.account.balance);
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
            setMessage("An error occurred while fetching balance.");
        }
    };

    useEffect(() => {
        getBalance();
    }, []);

    const handlePlayGame = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5001/play-dice-game", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            if (!response.ok) {
                setMessage(data.message);
            } else {
                setMessage(data.message);
                getBalance();
            }
        } catch (error) {
            console.error("Error playing dice game:", error);
            setMessage("An error occurred while playing the game.");
        }
    };

    return (
        <div className="container dicegame-content">
            <h2>Dice Game</h2>
            <p>Your current balance: ${balance}</p>
            <button onClick={handlePlayGame}>Place Bet of $50</button>
            <p>{message}</p>
            <button onClick={() => navigate("/home")}>Back</button>
        </div>
    );
}

export default DiceGame;
