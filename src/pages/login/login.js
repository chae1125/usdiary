import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import Menu from '../../components/menu';
import google from '../../assets/images/google.png';

Modal.setAppElement('#main'); // 모달 접근성을 위한 설정

const Login = () => {
    const [sign_id, setSignId] = useState('');
    const [password, setPassword] = useState('');
    const [hover, setHover] = useState(false);
    const [error, setError] = useState(''); // 오류 상태 추가
    const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태 추가
    const navigate = useNavigate();
    let isMounted = true;

    useEffect(() => {
        return () => {
            isMounted = false; // 언마운트 시 isMounted를 false로 설정
        };
    }, []);

    const handleGoogleLogin = () => {
        window.location.href = 'https://api.usdiary.site/users/login/google';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 서버로 보낼 데이터 준비
        const loginData = {
            sign_id: sign_id,
            password: password,
        };
        console.log(loginData);

        try {
            // 서버에 POST 요청 보내기
            const response = await fetch('https://api.usdiary.site/users/login', { // 서버 URL 확인
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const result = await response.json();
                const userTendency = result.data.user?.user_tendency;
                const token = result.data.token;
                const lastLogin = result.data.user?.last_login; // last_login 값 가져오기
                localStorage.setItem('token', token);
                console.log('User Tendency:', userTendency);
                console.log('Token:', token);
                
                // last_login이 null인 경우 특정 페이지로 리디렉션
                if (lastLogin === null) {
                    navigate('/tendency/question'); // 처음 로그인 시 질문 페이지로 이동
                } else {
                    navigate('/home', { state: { userTendency: userTendency } }); // 일반 로그인 시 홈으로 이동
                }
                
                console.log('로그인 성공:', result);
                setError(''); // 오류 상태 초기화
            } else {
                const errorResult = await response.json();
                console.error('로그인 실패:', errorResult.message);
                setError(errorResult.message); // 오류 상태 설정
                setModalIsOpen(true); // 모달 열기
            }
        } catch (error) {
            console.error('로그인 중 오류 발생:', error);
            setError('로그인 중 오류가 발생했습니다.'); // 오류 상태 설정
            setModalIsOpen(true); // 모달 열기
        }
    };

    const handleFindIdClick = (e) => {
        e.preventDefault();
        navigate('/findId');
    };

    const handleSignupClick = (e) => {
        e.preventDefault();
        navigate('/signup');
    };

    return (
        <div className='wrap'>
            <Menu />
            <div className="login-page__container">
                <div className="login-page__left">
                    <div
                        className="login-page__logo"
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        {hover ? (
                            <>
                                우리의 일상을<br />
                                <span className="login-page__logo--hover1">FOREST</span> 에,
                                <br />
                                <span className="login-page__logo--hover2">CITY</span> 에,
                                <br />
                                <span className="login-page__logo--hover3">SEA</span> 에,
                                <br />
                                담아보세요!
                            </>
                        ) : (
                            <>
                                우리의 일상을<br />
                                ________ 에,<br />
                                _____ 에,<br />
                                ____ 에<br />
                                담아보세요!
                            </>
                        )}
                    </div>
                </div>
                <div className="login-page__right">
                    <div className="login-page__form">
                        <form className="login-page__form-container" onSubmit={handleSubmit}>
                            <div className="login-page__title">Login</div>
                            <div className="login-page__input-container">
                                <input
                                    id="sign_id"
                                    name="sign_id"
                                    type="text"
                                    value={sign_id}
                                    onChange={(e) => setSignId(e.target.value)}
                                    placeholder="ID"
                                    className="login-page__input"
                                    required />
                                <svg className="login-page__input-icon" width="20" height="19.33" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="15" cy="7" r="6.25" stroke="#757575" strokeWidth="1.5" />
                                    <path d="M29 28V20.5C29 18.8431 27.6569 17.5 26 17.5H4C2.34315 17.5 1 18.8431 1 20.5V28" stroke="#757575" strokeWidth="1.5" />
                                    <path d="M0.267572 28L29.7258 28" stroke="#757575" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <div className="login-page__input-container">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    className="login-page__input"
                                    required />
                                <svg className="login-page__input-icon" width="20" height="23.08" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="10.2046" y="0.75" width="5.59091" height="14.5" rx="1.25" stroke="#757575" strokeWidth="1.5" />
                                    <path d="M25.25 19C25.25 24.5484 19.8878 29.25 13 29.25C6.11218 29.25 0.75 24.5484 0.75 19C0.75 13.4516 6.11218 8.75 13 8.75C19.8878 8.75 25.25 13.4516 25.25 19Z" fill="white" stroke="#757575" strokeWidth="1.5" />
                                    <line x1="13.2085" y1="14.6787" x2="13.2085" y2="19.1787" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" />
                                    <ellipse cx="13.0002" cy="23" rx="1.18182" ry="1" fill="#757575" />
                                </svg>
                            </div>
                            <div className="login-page__links">
                                <a href="/findId" className="login-page__link" onClick={handleFindIdClick}>아이디 찾기 / 비밀번호 찾기</a>
                            </div>
                            <button type="submit" className="login-page__button">Log in</button>

                            <div className="login-page__signup">
                                <span className="login-page__signup-text">아직 회원이 아니신가요?</span>
                                <a href="/signup" className="login-page__signup-link" onClick={handleSignupClick}>회원가입 하기</a>
                            </div>
                            <div className="login-page__divider-with-text">
                                <div className="login-page__divider-line-left"></div>
                                <span className="divider-text">소셜 로그인</span>
                                <div className="login-page__divider-line-right"></div>
                            </div>
                            <img
                                src={google}
                                alt="Google 로그인"
                                className="login-page__google-image"
                                onClick={handleGoogleLogin}
                            />
                        </form>
                    </div>
                </div>

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    contentLabel="Error Message"
                    className="login-page__modal"
                    overlayClassName="login-page__modal-overlay"
                >
                    <h3 className="login-page__modal-title">로그인 실패</h3>
                    <div className="login-page__divider"></div>
                    <p className="login-page__modal-message">{error}</p>
                    <button onClick={() => setModalIsOpen(false)} className="login-page__modal-button">닫기</button>
                </Modal>
            </div>
        </div>
    );
};

export default Login;
