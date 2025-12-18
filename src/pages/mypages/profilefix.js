import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Modal from 'react-modal'; // 모달 라이브러리
import '../../assets/css/profilefix.css';
import Menu from '../../components/menu';
import ProfileMenu from '../../components/profileMenu';

const ProfileFix = () => {
  const [userId, setUserId] = useState(null);
  const [activeButton, setActiveButton] = useState('Profile');
  const [profileImage, setProfileImage] = useState(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false); // 이메일 인증 모달 상태
  const [verificationCode, setVerificationCode] = useState(Array(6).fill('')); // 인증번호 입력 필드 상태
  const [emailVerificationStatus, setEmailVerificationStatus] = useState(''); // 인증 상태
  const [userData, setUserData] = useState({
    user_nick: '',
    user_email: '',
    user_name: '',
    user_phone: '',
    user_birthday: '',
    user_gender: '',
    user_id: '',
    user_pwd: '',
    user_points: 0,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  // 로그인한 사용자 정보 가져오기
  const fetchUserData = async () => {
    try {
      // 로컬 스토리지에서 JWT 토큰 가져오기
      const token = localStorage.getItem('token'); // 또는 sessionStorage 등 사용
      if (token) {
        const decodedToken = jwtDecode(token); // JWT 토큰 디코딩
        const userId = decodedToken.user_id; // 토큰에서 user_id 추출
        fetchUserProfile(userId);
        setUserId(userId);
      } else {
        console.error('로그인 정보가 없습니다.'); // JWT 토큰 없으면 에러 처리
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }
  };

  // 개인정보 가져오기
  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`https://api.usdiary.site/mypages/profiles/${userId}`);
      const result = await response.json();
      if (response.ok) {
        setUserData(result.data);
        if (result.data.profile_img) {
          setProfileImage(result.data.profile_img);
        }
      } else {
        console.error('개인정보 가져오기 실패:', result.message);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // 개인정보 수정 API 호출
  const handleUpdateProfile = async () => {

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!password || !confirmPassword) {
      alert("비밀번호와 비밀번호 확인을 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      // 프로필 이미지를 업로드할 경우, URL을 서버에서 받아서 userData에 설정해야 할 수 있습니다.
      const updatedData = {
        user_pwd: password,
        user_nick: userData.user_nick,
        user_email: userData.user_email,
        user_name: userData.user_name,
        user_phone: userData.user_phone,
        user_birthday: userData.user_birthday,
        user_gender: userData.user_gender,
        profile_img: profileImage,  // 프로필 이미지는 상태에 저장된 이미지 URL을 사용
      };

      console.log('Updated data being sent:', updatedData);

      const response = await fetch(`https://api.usdiary.site/mypages/profiles/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      console.log('Server response:', result);
      if (response.ok) {
        alert('개인정보 수정 성공');
      } else {
        console.error('개인정보 수정 실패:', result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  // 이메일 중복 확인 버튼 클릭 시 모달 열기
  const handleEmailVerification = () => {
    setIsVerificationModalOpen(true);
  };

  // 팝업 닫기
  const handleClosePopup = () => {
    setIsVerificationModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 인증 코드 변경 처리
  const handleCodeChange = (e, index) => {
    const updatedCodes = [...verificationCode];
    updatedCodes[index] = e.target.value;
    setVerificationCode(updatedCodes);
  };

  // 인증 코드 검증
  const handleCodeVerification = () => {
    const code = verificationCode.join('');
    if (code === '123456') {
      setEmailVerificationStatus('인증을 성공했습니다.');
      setIsVerificationModalOpen(false);
    } else {
      setEmailVerificationStatus('다시 시도해주세요.');
    }
  };

  const handleBirthdayChange = (e, type) => {
    const value = e.target.value;

    setUserData((prevState) => {
      let newBirthday = prevState.user_birthday || '0000-00-00'; // 초기값이 없으면 "0000-00-00"으로 설정

      // type에 따라 연도, 월, 일을 업데이트
      if (type === 'year') {
        newBirthday = `${value}-${newBirthday.split('-')[1]}-${newBirthday.split('-')[2]}`;
      } else if (type === 'month') {
        newBirthday = `${newBirthday.split('-')[0]}-${value}-${newBirthday.split('-')[2]}`;
      } else if (type === 'day') {
        newBirthday = `${newBirthday.split('-')[0]}-${newBirthday.split('-')[1]}-${value}`;
      }

      return { ...prevState, user_birthday: newBirthday };
    });
  };

  const handlePhoneChange = (e, index) => {
    const value = e.target.value;

    setUserData((prevState) => {
      // 전화번호가 없으면 기본값 '000-0000-0000'로 초기화
      const phoneParts = (prevState.user_phone || '000-0000-0000').split('-');
      phoneParts[index] = value; // 수정된 부분만 업데이트

      // 전화번호를 다시 '000-0000-0000' 형식으로 결합
      const newPhone = phoneParts.join('-');

      return { ...prevState, user_phone: newPhone };
    });
  };

  return (
    <div className="wrap">
      <Menu />

      <div className="profile">
        <ProfileMenu />
        <div className="fix_content-box">
          {activeButton === 'Profile' && (
            <div className="fix_profile-section">
              <h2 className="fix_profile-title">개인정보 수정</h2>
              <hr className="fix_divider" />
              <div className="fix_profile-form">
                {/* 프로필 사진 */}
                <div className="fix_form-group">
                  <label htmlFor="profile-image">프로필 사진</label>
                  <div className="fix_profile-image-container">
                    <div className="fix_profile-image-wrapper">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="fix_profile-image" />
                      ) : (
                        <div className="fix_profile-image-placeholder" style={{ backgroundColor: '#E0E0E0' }} />
                      )}
                    </div>
                    <div className="fix_profile-image-info">
                      <span className="fix_profile-image-text">프로필 사진을 등록해주세요.</span>
                      <span className="fix_profile-image-note">이미지 파일 크기 최대 2MB 미만</span>
                    </div>
                  </div>
                  <div className="fix_profile-buttons">
                    <label className="fix_upload-button" htmlFor="file-upload">등록</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="file-upload"
                      style={{ display: 'none' }} // 파일 선택창 숨기기
                    />
                    <button className="fix_remove-button" onClick={handleRemoveImage}>삭제</button>
                  </div>
                </div>

                {/* 이름 */}
                <div className="fix_form-group">
                  <label htmlFor="name">이름 *</label>
                  <input
                    type="text"
                    id="name"
                    className="fix_form-input"
                    style={{ backgroundColor: '#EEEEEE', color: '#2f2f2f' }}
                    disabled
                    value={userData.user_name} // 사용자 이름 값
                    readOnly
                  />
                </div>

                {/* 닉네임 */}
                <div className="fix_form-group">
                  <label htmlFor="nickname">닉네임 *</label>
                  <input
                    type="text"
                    id="nickname"
                    className="fix_form-input"
                    style={{ backgroundColor: '#EEEEEE', color: '#2f2f2f' }}
                    disabled
                    value={userData.user_nick} // 사용자 닉네임 값
                    readOnly
                  />
                </div>

                {/* 아이디 */}
                <div className="fix_form-group">
                  <label htmlFor="username">아이디 *</label>
                  <input
                    type="text"
                    id="sign_id"
                    className="fix_form-input"
                    style={{ backgroundColor: '#EEEEEE', color: '#2f2f2f' }}
                    disabled
                    value={userData.sign_id} // 사용자 아이디 값
                    readOnly
                  />
                </div>

                {/* 비밀번호 */}
                <div className="fix_form-group">
                  <label htmlFor="password">비밀번호 *</label>
                  <input type="password" id="password" className="fix_form-input" placeholder="비밀번호 입력" />
                </div>

                {/* 비밀번호 확인 */}
                <div className="fix_form-group">
                  <label htmlFor="confirm-password">비밀번호 확인 *</label>
                  <input type="password" id="confirm-password" className="fix_form-input" placeholder="비밀번호 확인" />
                </div>

                {/* 이메일 */}
                <div className="fix_form-group">
                  <label htmlFor="email">이메일 *</label>
                  <div className="fix_email-split">
                    <input
                      type="text"
                      id="email"
                      className="fix_form-input"
                      value={userData.user_email.split('@')[0]} // 사용자 이메일 값
                      disabled
                    />
                    <span>@</span>
                    <input
                      type="text"
                      className="fix_form-input"
                      value={userData.user_email.split('@')[1]} // 이메일 '@' 뒤 부분
                      disabled
                    />
                  </div>
                  <button className="fix_verify-button" style={{ height: '40px' }} onClick={handleEmailVerification}>이메일 중복확인</button>
                </div>

                {/* 전화번호 */}
                <div className="fix_form-group">
                  <label htmlFor="phone">전화번호</label>
                  <div className="fix_phone-split">
                    <input
                      type="text"
                      className="fix_form-input"
                      value={userData.user_phone?.split('-')[0] || ''} // 전화번호 첫 번째 부분
                      onChange={(e) => handlePhoneChange(e, 0)}
                    />
                    <input
                      type="text"
                      className="fix_form-input"
                      value={userData.user_phone?.split('-')[1] || ''} // 전화번호 두 번째 부분
                      onChange={(e) => handlePhoneChange(e, 1)}
                    />
                    <input
                      type="text"
                      className="fix_form-input"
                      value={userData.user_phone?.split('-')[2] || ''} // 전화번호 세 번째 부분
                      onChange={(e) => handlePhoneChange(e, 2)}
                    />
                  </div>
                </div>

                {/* 생년월일 */}
                <div className="fix_form-group">
                  <label>생년월일 *</label>
                  <div className="fix_date-picker">
                    <select className="fix_form-input" value={userData.user_birthday?.split('-')[0] || ''} onChange={(e) => handleBirthdayChange(e, 'year')}>
                      {Array.from({ length: 2024 - 1950 + 1 }, (_, i) => (
                        <option key={i} value={1950 + i}>{1950 + i}</option>
                      ))}
                    </select>
                    <select className="fix_form-input" value={userData.user_birthday?.split('-')[1] || ''} onChange={(e) => handleBirthdayChange(e, 'month')}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i + 1}>{i + 1}월</option>
                      ))}
                    </select>
                    <select className="fix_form-input" value={userData.user_birthday?.split('-')[2] || ''} onChange={(e) => handleBirthdayChange(e, 'day')}>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i} value={i + 1}>{i + 1}일</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 성별 */}
                <div className="fix_form-group">
                  <label htmlFor="gender">성별</label>
                  <select
                    id="gender"
                    className="fix_form-input"
                    name="user_gender"
                    value={userData.user_gender ? "M" : "F"}
                    onChange={(e) => handleInputChange({
                      target: { name: "user_gender", value: e.target.value === "M" }
                    })}
                  >
                    <option value="">선택</option>
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                  </select>
                </div>

                {/* 성향 */}
                <div className="fix_form-group">
                  <label htmlFor="tendency">성향</label>
                  <input
                    type="text"
                    id="tendency"
                    className="fix_form-input"
                    disabled
                    value={userData.user_tendency} // 사용자 성향 값
                  />
                </div>

                {/* 포인트 */}
                <div className="fix_form-group">
                  <label htmlFor="points">포인트</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      id="points"
                      className="fix_form-input"
                      value={userData.user_points} // 사용자 포인트 값
                    />
                    <span>점</span>
                  </div>
                </div>
                <hr className="fix_divider" />

                {/* 수정 및 탈퇴 버튼 */}
                <div className="fix_form-actions">
                  <button className="fix_submit-button" onClick={handleUpdateProfile}>수정</button>
                  <button className="fix_delete-account-button">회원 탈퇴</button>
                </div>
              </div>

              {/* 이메일 인증 모달 */}
              <Modal
                isOpen={isVerificationModalOpen}
                onRequestClose={handleClosePopup}
                className="SignUp-page__popup"
              >
                <div className="SignUp-page__popup-content">
                  <span className="SignUp-page__popup-close" onClick={handleClosePopup}>×</span>
                  <h2 className="SignUp-page__popup-title">이메일 인증</h2>
                  <p>이메일로 인증번호를 전송했습니다.</p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileFix;
