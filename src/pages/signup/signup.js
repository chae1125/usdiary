import React, { useState, useEffect } from 'react'; // useEffect 추가
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import '../../assets/css/signup.css'; // 기존 CSS 파일 임포트
import Menu from '../../components/menu';

Modal.setAppElement('#main'); // 모달 접근성을 위한 설정

const SignUp = () => {
    const [formData, setFormData] = useState({
        user_name: '',
        user_nick: '',
        sign_id: '',
        user_pwd: '',
        confirmPassword: '',
        user_email: '',
        user_phone: '',
        user_birthday: '',
        user_gender: '',
    });
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState({});
    const [isCodeValid, setIsCodeValid] = useState(false);
    const [emailVerificationStatus, setEmailVerificationStatus] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태 추가
    const [error, setError] = useState(''); // 오류 상태 추가
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false); // 인증 모달 상태 추가
    const navigate = useNavigate();

    useEffect(() => {
        // 비밀번호와 비밀번호 확인이 일치하는지 실시간으로 확인
        if (formData.user_pwd !== formData.confirmPassword) {
            setErrors(prevErrors => ({ ...prevErrors, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
        } else {
            setErrors(prevErrors => {
                const { confirmPassword, ...rest } = prevErrors;
                return rest;
            });
        }
    }, [formData.user_pwd, formData.confirmPassword]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleCodeChange = (e, index) => {
        const newCode = [...verificationCode];
        newCode[index] = e.target.value;
        if (e.target.value && index < 5) {
            document.getElementById(`code-${index + 1}`).focus();
        }
        setVerificationCode(newCode);
    };

    const validateForm = () => {
        const newErrors = {};
    
        if (!formData.user_name) newErrors.user_name = '이름을 입력해주세요.';
        if (!formData.user_nick) newErrors.user_nick = '닉네임을 입력해주세요.';
        if (!formData.sign_id) {
            newErrors.sign_id = '아이디를 입력해주세요.';
        } else if (formData.sign_id.length < 6) {
            newErrors.sign_id = '아이디는 6자 이상이어야 합니다.';
        }
        if (!formData.user_pwd) newErrors.user_pwd = '비밀번호를 입력해주세요.';
        if (!formData.confirmPassword) newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
        if (!formData.user_email) newErrors.user_email = '이메일을 입력해주세요.';
        if (!formData.user_birthday) newErrors.user_birthday = '생일을 입력해주세요.';
        if (!formData.user_phone) newErrors.user_phone = '전화번호를 입력해주세요.';
    if (!formData.user_gender) newErrors.user_gender = '성별을 선택해주세요.';

    
        if (formData.user_pwd && !/^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,15}$/.test(formData.user_pwd)) {
            newErrors.user_pwd = '특수문자를 포함한 6~15자로 입력해주시기 바랍니다.';
        }
    
        if (formData.user_email && !isCodeValid) {
            newErrors.user_email = '이메일 인증을 하지 않았습니다.';
        }
    
        setErrors(newErrors);
    
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (validateForm()) {
            if (!isCodeValid) {
                setErrors(prevErrors => ({ ...prevErrors, user_email: '이메일 인증을 하지 않았습니다.' }));
                return;
            }
    
            const signupData = {
                user_name: formData.user_name,
                user_nick: formData.user_nick,
                sign_id: formData.sign_id,
                user_pwd: formData.user_pwd,
                confirmPassword: formData.confirmPassword,
                user_email: formData.user_email,
                user_phone: formData.user_phone,
                user_birthday: formData.user_birthday,
                user_gender: formData.user_gender,
                verificationCode: verificationCode.join('') // 인증번호 추가
            };
    
            try {
                const response = await fetch('https://api.usdiary.site/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(signupData),
                });
    
                const result = await response.json();
    
                if (response.ok) {
                     // 회원가입 성공 시 토큰을 localStorage에 저장
                    const token = result.data.token;
                    localStorage.setItem('authToken', token); // 로컬스토리지에 토큰 저장
                    navigate('/');
                } else {
                    console.error('회원가입 실패:', result.message);
                    setError(result.message);
                    setModalIsOpen(true);
                }
            } catch (error) {
                console.error('회원가입 중 오류 발생:', error);
                setError('회원가입 중 오류가 발생했습니다.');
                setModalIsOpen(true);
            }
        }
    };
    
    const handleCodeVerification = async () => {
        try {
            const response = await fetch('https://api.usdiary.site/register/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verificationCode: verificationCode.join(''), // 인증 코드
                    user_email: formData.user_email // 이메일 추가
                }),
            });
            const result = await response.json();

            if (result.success) {
                setIsCodeValid(true);
                setEmailVerificationStatus('이메일 인증이 완료되었습니다.');
                setIsVerificationModalOpen(false); // 인증 모달 닫기
            } else {
                setEmailVerificationStatus('인증 코드가 올바르지 않습니다. 다시 시도해 주세요.');
            }
        } catch (error) {
            setEmailVerificationStatus('오류가 발생했습니다. 나중에 다시 시도해 주세요.');
        }
    };

    const handleOpenPopup = async () => {
        try {
            const response = await fetch('https://api.usdiary.site/register/send-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_email: formData.user_email }),
            });
            const result = await response.json();

            if (response.ok) {
                setIsVerificationModalOpen(true); // 이메일 인증 모달 열기
            } else {
                console.error('이메일 인증코드 전송 실패:', result.message);
                setError(result.message); // 오류 상태 설정
                setModalIsOpen(true); // 오류 모달 열기
            }
        } catch (error) {
            console.error('이메일 인증코드 전송 중 오류 발생:', error);
            setError('이메일 인증코드 전송 중 오류가 발생했습니다.'); // 오류 상태 설정
            setModalIsOpen(true); // 오류 모달 열기
        }
    };

    const handleClosePopup = () => {
        setIsVerificationModalOpen(false); // 인증 모달 닫기
        setModalIsOpen(false); // 오류 모달 닫기
    };

    const handleIdCheck = async () => {
        try {
            const response = await fetch(`https://api.usdiary.site/register/idcheck?uid=${formData.sign_id}`, {
                method: 'GET',
            });

            const result = await response.json();

            if (response.ok) {
                if (result.exists) {
                    setErrors(prevErrors => ({ ...prevErrors, sign_id: '이미 사용하고 있는 아이디 입니다. 다른 아이디로 다시 입력해주세요.' }));
                } else {
                    setErrors(prevErrors => ({ ...prevErrors, sign_id: '사용 가능한 아이디입니다.' }));
                }
            } else {
                console.error('아이디 체크 실패:', result.message);
                setErrors(prevErrors => ({ ...prevErrors, sign_id: result.message }));
            }
        } catch (error) {
            console.error('아이디 체크 중 오류 발생:', error);
            setErrors(prevErrors => ({ ...prevErrors, sign_id: '아이디 체크 중 오류가 발생했습니다.' }));
        }
    };

    const handleNicknameCheck = async () => {
        try {
            const response = await fetch(`https://api.usdiary.site/register/nicknamecheck?unick=${formData.user_nick}`, {
                method: 'GET',
            });

            const result = await response.json();

            if (response.ok) {
                if (result.exists) {
                    setErrors(prevErrors => ({ ...prevErrors, user_nick: '이미 사용하고 있는 닉네임입니다. 다른 닉네임으로 다시 입력해주세요.' }));
                } else {
                    setErrors(prevErrors => ({ ...prevErrors, user_nick: '사용 가능한 닉네임입니다.' }));
                }
            } else {
                console.error('닉네임 체크 실패:', result.message);
                setErrors(prevErrors => ({ ...prevErrors, user_nick: result.message }));
            }
        } catch (error) {
            console.error('닉네임 체크 중 오류 발생:', error);
            setErrors(prevErrors => ({ ...prevErrors, user_nick: '닉네임 체크 중 오류가 발생했습니다.' }));
        }
    };

    return (
        <div className='wrap'>
            <Menu />
            <div className="SignUp">
                <form onSubmit={handleSubmit} className="SignUp-page__form">
                    <h2 className="SignUp-page__form-title">회원가입 하기</h2>

                    <div className="SignUp-page__input-group">
                        <label htmlFor="user_name" className="SignUp-page__label">이름 *</label>
                        <div className="SignUp-page__input-wrapper">
                            <input
                                type="text"
                                id="user_name"
                                name="user_name"
                                value={formData.user_name}
                                onChange={handleInputChange}
                                className="SignUp-page__input"
                                placeholder="이름 입력"
                            />
                        </div>
                        {errors.user_name && <small className="SignUp-page__error-message">{errors.user_name}</small>}
                    </div>

                    <div className="SignUp-page__input-group">
                        <label htmlFor="user_nick" className="SignUp-page__label">닉네임 *</label>
                        <div className="SignUp-page__input-wrapper">
                            <input
                                type="text"
                                id="user_nick"
                                name="user_nick"
                                value={formData.user_nick}
                                onChange={handleInputChange}
                                className="SignUp-page__input"
                                placeholder="닉네임 입력"
                            />
                            <button type="button" className="SignUp-page__input-check-button" onClick={handleNicknameCheck}>중복 확인</button>
                        </div>
                        {errors.user_nick && <small className="SignUp-page__error-message">{errors.user_nick}</small>}
                    </div>

                    <div className="SignUp-page__input-group">
                        <label htmlFor="sign_id" className="SignUp-page__label">아이디 *</label>
                        <div className="SignUp-page__input-wrapper">
                            <input
                                type="text"
                                id="sign_id"
                                name="sign_id"
                                value={formData.sign_id}
                                onChange={handleInputChange}
                                className="SignUp-page__input"
                                placeholder="아이디 입력"
                            />
                            <button type="button" className="SignUp-page__input-check-button" onClick={handleIdCheck}>중복 확인</button>
                        </div>
                        {errors.sign_id && <small className="SignUp-page__error-message">{errors.sign_id}</small>}
                    </div>

                    <div className="SignUp-page__input-group">
                        <label htmlFor="user_pwd" className="SignUp-page__label">비밀번호 *</label>
                        <input
                            type="password"
                            id="user_pwd"
                            name="user_pwd"
                            value={formData.user_pwd}
                            onChange={handleInputChange}
                            className="SignUp-page__input"
                            placeholder="비밀번호 입력 (특수문자 포함, 6~15글자)"
                        />
                        {errors.user_pwd && <small className="SignUp-page__error-message">{errors.user_pwd}</small>}
                    </div>

                    <div className="SignUp-page__input-group">
                        <label htmlFor="confirmPassword" className="SignUp-page__label">비밀번호 확인 *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="SignUp-page__input"
                            placeholder="비밀번호를 다시 입력해주세요."
                        />
                        {errors.confirmPassword && <small className="SignUp-page__error-message">{errors.confirmPassword}</small>}
                    </div>

                    <div className="SignUp-page__input-group">
                        <label htmlFor="user_email" className="SignUp-page__label">이메일 *</label>
                        <div className="SignUp-page__input-wrapper">
                            <input
                                type="email"
                                id="user_email"
                                name="user_email"
                                value={formData.user_email}
                                onChange={handleInputChange}
                                className="SignUp-page__input"
                                placeholder="이메일 입력"
                            />
                            <button type="button" className="SignUp-page__input-check-button" onClick={handleOpenPopup}>이메일 인증</button>
                        </div>
                        {errors.user_email && <small className="SignUp-page__error-message">{errors.user_email}</small>}
                    </div>

                    <div className="SignUp-page__input-group">
                        <label htmlFor="user_phone" className="SignUp-page__label">전화번호</label>
                        <input
                            type="tel"
                            id="user_phone"
                            name="user_phone"
                            value={formData.user_phone}
                            onChange={handleInputChange}
                            className="SignUp-page__input"
                            placeholder="010-XXXX-XXXX"
                        />
                    </div>

                    <div className="SignUp-page__date-gender-wrapper">
                        <div className="SignUp-page__input-date">
                            <label htmlFor="user_birthday" className="SignUp-page__label">생일 *</label>
                            <input
                                type="date"
                                id="user_birthday"
                                name="user_birthday"
                                value={formData.user_birthday}
                                onChange={handleInputChange}
                                className="SignUp-page__input-date"
                            />
                            {errors.user_birthday && <small className="SignUp-page__error-message">{errors.user_birthday}</small>}
                        </div>

                        <div className="SignUp-page__input-gender">
                            <label htmlFor="user_gender" className="SignUp-page__label">성별</label>
                            <select
                                id="user_gender"
                                name="user_gender"
                                value={formData.user_gender}
                                onChange={handleInputChange}
                                className="SignUp-page__input-gender"
                            >
                                <option value="">선택하세요</option>
                                <option value="male">남성</option>
                                <option value="female">여성</option>
                            </select>
                            {errors.user_gender && <small className="SignUp-page__error-message">{errors.user_gender}</small>}
                        </div>
                    </div>

                    <button type="submit" className="SignUp-page__submit-button">Create Account</button>

                    {/* 오류 모달 */}
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={handleClosePopup}
                        className="SignUp-page__popup"
                    >
                        <div className="SignUp-page__popup-content">
                            <span className="SignUp-page__popup-close" onClick={handleClosePopup}>×</span>
                            <h2 className="SignUp-page__popup-title">회원가입 오류</h2>
                            <p>{error}</p>
                            <button className="SignUp-page__code-submit-button" onClick={handleClosePopup}>확인</button>
                        </div>
                    </Modal>

                    {/* 이메일 인증 모달 */}
                    <Modal
                        isOpen={isVerificationModalOpen}
                        onRequestClose={handleClosePopup}
                        className="SignUp-page__popup"
                    >
                        <div className="SignUp-page__popup-content">
                            <span className="SignUp-page__popup-close" onClick={handleClosePopup}>×</span>
                            <h2 className="SignUp-page__popup-title">이메일 인증</h2>
                            <p>{formData.user_name} 님의 메일로 인증번호를 전송했습니다.</p>
                            <p>확인된 인증번호를 작성해주세요.</p>
                            <div className="SignUp-page__code-inputs">
                                {verificationCode.map((code, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        id={`code-${index}`}
                                        className="SignUp-page__code-input"
                                        maxLength="1"
                                        value={code}
                                        onChange={(e) => handleCodeChange(e, index)}
                                    />
                                ))}
                            </div>
                            <button className="SignUp-page__code-submit-button" onClick={handleCodeVerification}>인증하기</button>
                            <p>{emailVerificationStatus}</p>
                        </div>
                    </Modal>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
