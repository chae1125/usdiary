import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Forest from "./forest";
import City from "./city";

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userTendency = location.state?.userTendency; // location.state에서 userTendency 가져오기

    useEffect(() => {
        // Decode the token and check last_login
        const token = localStorage.getItem("token");
        
        if (token) {
            const decodedToken = jwtDecode(token);
            console.log("Decoded token:", decodedToken);

            // If last_login is null, navigate to /question page
            if (!decodedToken.last_login && !userTendency) { // Assuming null or undefined
                navigate("/question", { replace: true });
                return;
            }
        }
    }, [navigate, userTendency]);

    useEffect(() => {
        if (userTendency) {
            localStorage.setItem('selectedMenu', userTendency === '숲' ? 'forest' : userTendency === '도시' ? 'city' : 'sea');
        }
    }, [userTendency]);

    useEffect(() => {
        if (userTendency) {
            localStorage.setItem('userTendency', userTendency);
        }
    }, [userTendency]);

    if (userTendency === '숲') {
        return <Forest />;
    } else if (userTendency === '도시') {
        return <City />;
    } else {
        return (
            <div>
                <h1>알 수 없는 경향성</h1>
                <p>해당 경향성에 맞는 페이지를 찾을 수 없습니다.</p>
            </div>
        );
    }
}

export default Home;
