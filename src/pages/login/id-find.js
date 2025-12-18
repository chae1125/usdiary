import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../assets/css/findId.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Menu from '../../components/menu';

const FindId = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [birthdate, setBirthdate] = useState(null);
    const [foundId, setFoundId] = useState(null);
    const [showResult, setShowResult] = useState(false); // 결과 표시 상태
    const navigate = useNavigate();

    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedBirthdate = formatDate(birthdate);

        try {
            const response = await axios.post('https://api.usdiary.site/users/findID', {
                user_name: name,
                user_email: email,
                user_birthday: formattedBirthdate
            });

            // 서버에서 응답을 받았을 때
            if (response.status === 200) {
                setFoundId(response.data.data.sign_id);
                setShowResult(true);
            } else {
                alert(response.data.message || '아이디 찾기 실패');
                setFoundId(null);
                setShowResult(false);
            }
        } catch (error) {
            console.error('서버와의 통신 중 오류 발생:', error);
            alert('아이디 찾기 실패: 서버 오류');
            setFoundId(null);
            setShowResult(false);
        }
    };


    return (
        <div className='wrap'>
            <Menu />
            <div className='find-id-page__container'>
                <div className="find-id-page__buttons">
                    <div className="find-id-page__button find-id-page__button--black">
                        <button className="find-id-page__button-text">아이디 찾기</button>
                    </div>
                    <div
                        className="find-id-page__button find-id-page__button--white"
                        onClick={() => navigate('/findPwd')}>
                        <button className="find-id-page__button-text">비밀번호 찾기</button>
                    </div>
                </div>
                <h2>아이디 찾기</h2>
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
                        <div className="find-id-page__input-container">
                            <label htmlFor="birthdate" className="find-id-page__label">생일 *</label>
                            <DatePicker
                                className="find-id-page__input"
                                id="birthdate"
                                selected={birthdate}
                                onChange={(date) => setBirthdate(date)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="YYYY-MM-DD"
                                showYearDropdown
                                showMonthDropdown
                                dropdownMode="select"
                                maxDate={new Date()} // 현재 날짜 이전만 선택 가능
                                required
                            />
                        </div>
                        <button type="submit" className="find-id-page__find-button">Find My ID</button>
                    </form>
                ) : (
                    <div>

                        <div className="find-id-page__result-container">
                            <div className="find-id-page__result-box">
                                <p>{name} 님의 아이디입니다.</p>
                                <div className="find-id-page__id-box">
                                    <p>{foundId}</p>
                                </div>
                            </div>

                        </div>
                        <button onClick={() => navigate('/')} className="find-id-page__login-button">Go to Login</button>
                    </div>
                )}
            </div>
        </div>

    );
};

export default FindId;
