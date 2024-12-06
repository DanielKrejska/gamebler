import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/login");
        }

        const fetchHomeData = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch("http://localhost:5001/home", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    navigate("/", { replace: true });
                }
                else {
                    const data = await response.json();
                    setMessage(data.message);
                }
            } catch (error) {
                console.error("Error fetching home data:", error);
                navigate("/login", { replace: true });
            }
        };
        fetchHomeData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    }

    return (
        <div>
            <h1>Home</h1>
            {message && <p>{message}</p>}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Home;
