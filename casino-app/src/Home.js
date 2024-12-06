import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const [account, setAccount] = useState();
    const [profileImage, setProfileImage] = useState("");
    const [file, setFile] = useState(null);
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
                } else {
                    const data = await response.json();
                    setAccount(data.account);
                    setProfileImage(`http://localhost:5001${data.account.profileImage}`);
                }
            } catch (error) {
                console.error("Error fetching home data:", error);
                navigate("/login", { replace: true });
            }
        };
        fetchHomeData();
    }, [navigate]);

    const handleAddBalance = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5001/add-balance", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                alert("Error adding balance.");
                return;
            }
    
            const data = await response.json();
            setAccount((prevAccount) => ({
                ...prevAccount,
                balance: data.balance,
            }));
            alert("$100 added to your balance!");
        }
        catch (error) {
            console.error("Error adding balance:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("profileImage", file);

        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5001/upload-profile-image", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                console.error("Error uploading image.");
            } else {
                const data = await response.json();
                setProfileImage(`http://localhost:5001${data.profileImage}`);
                alert("Profile image updated successfully.");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    return (
        <div className="container home-content">
            <img src={profileImage} alt="Profile" width="150" height="150" />
            {account && <p className="profile-info">Hello {account.login}, your balance is ${account.balance}.</p>}
            
            <div className="upload-file">
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload Profile Image</button>
            </div>
            
            <button onClick={handleAddBalance}>Add $100</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Home;
