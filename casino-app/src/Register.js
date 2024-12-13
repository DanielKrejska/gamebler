import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5001/register", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({ login, password }),
            });

            const data = await response.json();
            setMessage(data.message);

            if (response.ok) {
                setLogin("");
                setPassword("");
                navigate("/login");
            }
        }
        catch (error) {
            console.error("Error:", error);
            setMessage("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="page-container">
            <form onSubmit={handleRegister}>
                <h2>Register</h2>
                <input
                    type="text"
                    placeholder="Login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
                {message && <p>{message}</p>}
                <button onClick={() => navigate('/login')}>
                Registered? Login Here
                </button>
            </form>
        </div>
    );
}


export default Register;

