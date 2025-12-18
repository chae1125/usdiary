import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo_US from '../assets/images/Logo_US.png';
import Logo_EARTH from '../assets/images/Logo_EARTH.png';
import alarm_white from '../assets/images/alarm_white.png';
import alarm_black from '../assets/images/alarm_black.png';
import logout_white from '../assets/images/logout_white.png';
import logout_black from '../assets/images/logout_black.png';
import '../assets/css/login.css';
import Alarm from '../components/alarm';

const Menu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAlarmOpen, setAlarmOpen] = useState(false);
    const [activeButton, setActiveButton] = useState('');
    const [userTendency, setUserTendency] = useState(null);

    // 페이지 이동 시 성향 저장
    useEffect(() => {
        if (userTendency) {
            const selectedMenu = userTendency === 1 ? 'forest' : userTendency === 2 ? 'city' : 'sea';
            localStorage.setItem('selectedMenu', selectedMenu);
        }
    }, [userTendency]);

    // 경로에 따라 활성 버튼 설정
    useEffect(() => {
        if (location.pathname === '/forest' || location.pathname === '/city' || location.pathname === '/sea' || location.pathname === '/friend' || location.pathname === '/home') {
            setActiveButton('home');
        } else if (location.pathname.includes('_diary')) {
            setActiveButton('diary');
        } else if (location.pathname === '/map') {
            setActiveButton('map');
        } else if (location.pathname === '/profile' || location.pathname === '/profilefix' || location.pathname === '/contact' || location.pathname === '/notification' || location.pathname.includes('mypage') || location.pathname === '/contact' || location.pathname === '/notification') {
            setActiveButton('profile');
        }
    }, [location.pathname]);

    // 홈 버튼 클릭 시 성향에 맞는 경로로 이동
    const handleHomeClick = (e) => {
        e.preventDefault();
        const savedMenu = localStorage.getItem('selectedMenu');
        if (savedMenu) navigate(`/${savedMenu}`);
    };

    // 다이어리 버튼 클릭 시 성향에 맞는 다이어리로 이동
    const handleDiaryClick = (e) => {
        e.preventDefault();
        const savedMenu = localStorage.getItem('selectedMenu');
        if (location.pathname !== '/friend' && savedMenu) {
            navigate(`/${savedMenu}_diary`);
        }
    };

    const handleMapClick = (e) => {
        e.preventDefault();
        navigate('/map');
    };

    const handleProfileClick = (e) => {
        e.preventDefault();
        navigate('/profile');
    };

    const handleLogoClick = (e) => {
        e.preventDefault();
        const storedTendency = localStorage.getItem('userTendency');
        if (storedTendency) {
            if (storedTendency === '숲') {
                navigate('/forest');
                localStorage.setItem('selectedMenu', 'forest');
            } else if (storedTendency === '도시') {
                navigate('/city');
                localStorage.setItem('selectedMenu', 'city');
            } else if (storedTendency === '바다') {
                navigate('/sea');
                localStorage.setItem('selectedMenu', 'sea');
            }
        }
    };

    const handleAlarmClick = () => setAlarmOpen(!isAlarmOpen);

    return (
        <div className="menu">
            <div className="logo" onClick={handleLogoClick}>
                <img src={Logo_US} className="logo_us" alt="Logo US" />
                <img src={Logo_EARTH} className="logo_earth" alt="Logo Earth" />
            </div>
            <div className="button">
                <div className={`btn ${activeButton === 'home' ? 'active' : ''}`} onClick={handleHomeClick} id="home">HOME</div>
                <div className={`btn ${activeButton === 'diary' ? 'active' : ''}`} onClick={handleDiaryClick} id="diary">DIARY</div>
                <div className={`btn ${activeButton === 'map' ? 'active' : ''}`} onClick={handleMapClick} id="map">MAP</div>
                <div className={`btn ${activeButton === 'profile' ? 'active' : ''}`} onClick={handleProfileClick} id="profile">PROFILE</div>
                <div className="btn" onClick={handleAlarmClick} id="alarm">
                    <img src={alarm_white} className="alarm_white" alt="Alarm White" />
                    <img src={alarm_black} className="alarm_black" alt="Alarm Black" />
                </div>
                <div className="btn" onClick={() => navigate('/')} id="logout">
                    <img src={logout_white} className="logout_white" alt="Logout White" />
                    <img src={logout_black} className="logout_black" alt="Logout Black" />
                </div>
            </div>
            <Alarm isOpen={isAlarmOpen} onClose={handleAlarmClick} />
        </div>
    );
};

export default Menu;
