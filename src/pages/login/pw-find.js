import React, { useState } from 'react';
import '../../assets/css/findId.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Menu from '../../components/menu';

const FindPwd = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [signId, setSignId] = useState('');
    const [temporaryPassword, setTemporaryPassword] = useState('');
    const [showResult, setShowResult] = useState(false); // 결과 표시 상태
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('https://api.usdiary.site/users/findPwd', {
                user_name: name,
                user_email: email,
                sign_id: signId
            });

            if (response.status === 200) {
                setTemporaryPassword(response.data.data.temporaryPassword);
                setShowResult(true);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                alert('사용자 정보와 일치하는 계정을 찾을 수 없습니다.');
            } else {
                alert('비밀번호 찾기 실패: 서버 오류');
            }
            setTemporaryPassword(null);
            setShowResult(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(temporaryPassword)
            .then(() => {
                alert('임시 비밀번호가 복사되었습니다.');
            })
            .catch((err) => {
                console.error('복사 실패:', err);
            });
    };

    return (
        <div className='wrap'>
            <Menu />
            <div className='find-id-page__container'>
                <div className="find-id-page__buttons">
                    <div
                        className="find-id-page__button find-id-page__button2--white"
                        onClick={() => navigate('/findId')}
                    >
                        <button className="find-id-page__button-text">아이디 찾기</button>
                    </div>
                    <div className="find-id-page__button find-id-page__button2--black">
                        <button className="find-id-page__button-text">비밀번호 찾기</button>
                    </div>
                </div>
                <h2>비밀번호 찾기</h2>
                {!showResult ? (
                    <form onSubmit={handleSubmit} className="find-id-page__form-container">
                        <div className="find-id-page__input-container">
                            <label htmlFor="name" className="find-id-page__label">이름 *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름 입력"
                                required
                                className="find-id-page__input"
                            />
                        </div>
                        <div className="find-id-page__input-container">
                            <label htmlFor="id" className="find-id-page__label">아이디 *</label>
                            <input
                                id="signId"
                                name="signId"
                                type="text"
                                value={signId}
                                onChange={(e) => setSignId(e.target.value)}
                                placeholder="아이디 입력"
                                required
                                className="find-id-page__input"
                            />
                        </div>
                        <div className="find-id-page__input-container">
                            <label htmlFor="email" className="find-id-page__label">이메일 *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일 입력"
                                required
                                className="find-id-page__input"
                            />
                        </div>
                        <button type="submit" className="find-id-page__find-button">Find My Password </button>
                    </form>
                ) : (
                    <div className="find-id-page__result-container">
                        <div className="find-id-page__result-box">
                            <p>{name} 님의 임시 비밀번호입니다. <br>
                            </br>로그인 후 비밀번호를 변경해주세요.</p>
                            <div className="find-id-page__pw-box">
                                <p>{temporaryPassword}</p>
                                <button onClick={copyToClipboard} className="find-id-page__copy-button">
                                    복사
                                </button>
                            </div>
                        </div>
                        <button onClick={() => navigate('/')} className="find-id-page__login-button">
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>

    );
}

export default FindPwd;