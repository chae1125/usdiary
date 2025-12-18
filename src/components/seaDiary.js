import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Viewer, Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import axios from 'axios'; // axios import
import imageCompression from 'browser-image-compression';

import sea from '../assets/images/sea.png';
import DateSelector from './dateSelector'; // DateSelector 컴포넌트 import
import RevealOptions from './revealOptions'; // RevealOptions 컴포넌트 import
import DropdownMenu from './dropdownMenu';

const SeaComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { diary } = location.state || {};

  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 날짜
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜
  const [diary_title, setTitle] = useState(''); // 제목
  const [diary_content, setEditorData] = useState(''); // 에디터 내용
  const [access_level, setSelectedDiv] = useState(0); // 공개범위
  const [diaryData, setDiaryData] = useState(null);
  const [post_photo, setFirstImageUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef(); // 에디터 ref
  const [compressedPhoto, setCompressedPhoto] = useState(null);

  const fetchDiaryData = useCallback(async () => {
    try {
        const response = await axios.get(`https://api.usdiary.site/diaries`, {
          params: { date: selectedDate.toISOString().split('T')[0] }
        }); // axios로 요청
        setDiaryData(response.data); // 불러온 데이터 설정
        setTitle(response.data.diary_title); // 제목 업데이트
        if (editorRef.current) {
            editorRef.current.getInstance().setHTML(response.data.diary_content); // 에디터 내용 설정
        }
    } catch (error) {
        console.error("Error fetching diary data:", error);
    }
}, [selectedDate]);

  useEffect(() => {
    if (diary) {
      setTitle(diary.diary_title); // 제목 업데이트
      if (editorRef.current) {
        editorRef.current.getInstance().setHTML(diary.diary_content); // 내용 설정
      }
      const createdAtDate = new Date(diary.createdAt);
      setSelectedDate(createdAtDate); // 선택된 날짜 업데이트
      setCurrentDate(createdAtDate);
    } else {
      fetchDiaryData(); // 다이어리가 없을 때만 데이터 fetch
    }
  }, [diary, fetchDiaryData]);

  // 선택된 날짜로 currentDate 업데이트
  const handleDateClick = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1); // 전날을 계산

    const selectedDate = new Date(date).toDateString();
    const todayDate = today.toDateString();
    const yesterdayDate = yesterday.toDateString();

    if (selectedDate === todayDate || selectedDate === yesterdayDate) {
      setSelectedDate(date);
      setCurrentDate(new Date(date)); // 클릭한 날짜를 가운데로 위치
      fetchDiaryData();
    }
  };

  // 공개범위 클릭 핸들러
  const handleDivClick = (index) => {
    setSelectedDiv(index);
  };

  const extractFirstImageUrl = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const img = doc.querySelector('img'); // 첫 번째 이미지 요소 선택
    return img ? img.src : null; // 이미지가 있으면 src 속성을 반환
  };

  const onChangeGetHTML = () => {
    if (editorRef.current && !diary) {
      const data = editorRef.current.getInstance().getHTML();
      setEditorData(data);
      const firstImageUrl = extractFirstImageUrl(data);
      setFirstImageUrl(firstImageUrl);
    }
  };

  const addImageBlobHook = async (blob, callback) => {
    try {
      if (!(blob instanceof Blob)) {
        console.error("The provided blob is not valid:", blob);
        return;
      }
  
      // 이미지 압축
      const compressedBlob = await imageCompression(blob, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800
      });
  
      if (compressedBlob) {
        // 압축된 이미지를 FormData에 추가하여 서버로 전송
        const formData = new FormData();
        formData.append('file', compressedBlob); // 서버에서 'file' 필드로 받음
  
        // 이미지 업로드 API 호출
        const response = await fetch('https://api.usdiary.site/diaries', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
  
        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('이미지 업로드 오류:', errorResponse);
          throw new Error('이미지 업로드에 실패했습니다.');
        }
  
        const result = await response.json();
        const imageUrl = result.url; // 서버에서 반환한 이미지 URL
  
        // 에디터에 이미지 삽입
        callback(imageUrl, 'alt text');
      } else {
        alert("이미지 압축에 실패했습니다.");
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    }
  };
  

  const compressImageSrcInContent = (content) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    const images = doc.querySelectorAll("img");

    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (src && src.startsWith("data:image")) {
        // Replace data:image with Blob URL
        const blob = new Blob([src.split(",")[1]], { type: "image/jpeg" });
        const blobUrl = URL.createObjectURL(blob);
        img.setAttribute("src", blobUrl);
      }
    });

    return doc.body.innerHTML;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!diary_title || !diary_content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append('diary_title', diary_title);

    const filteredContent = compressImageSrcInContent(editorRef.current.getInstance().getHTML());
    formData.append('diary_content', filteredContent);

    formData.append('access_level', access_level);
    formData.append('board_id', 3);

    if (compressedPhoto && Array.isArray(compressedPhoto)) {
      compressedPhoto.forEach((photo) => {
        formData.append('post_photo', photo); // 파일 이름은 서버에서 처리하도록 설정
      });
    }

    try {
      const response = await fetch('https://api.usdiary.site/diaries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // 서버로 데이터 전송
      });

      if (!response.ok) {
        const errorResponse = await response.json(); // 오류 응답 로그 추가
        console.error('서버에 오류가 발생했습니다:', errorResponse);
        throw new Error('서버에 오류가 발생했습니다.');
      }

      const result = await response.json();
      console.log('저장 완료:', result);
      navigate('/sea');
    } catch (error) {
      console.error("Error submitting diary:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true); // 편집 모드로 전환
  };

  const handleUpdate = async () => {
    if (!diary) return;

    const updatedDiary = {
      diary_title,
      diary_content: editorRef.current.getInstance().getHTML(),
      access_level,
      post_photo,
    };

    try {
      const formData = new FormData();
      formData.append('diary_title', updatedDiary.diary_title);
      formData.append('diary_content', updatedDiary.diary_content);
      formData.append('access_level', updatedDiary.access_level);
      formData.append('post_photo', updatedDiary.post_photo);

      const response = await fetch(`https://api.usdiary.site/diaries/${diary.diary_id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (response.ok) {
        console.log('수정 완료:', await response.json());
        setIsEditing(false); // 수정 후 편집 모드 해제
      } else {
        console.error('수정 실패:', response.statusText);
      }
    } catch (error) {
      console.error("Error editing diary:", error);
    }
  };


  const handleDelete = async () => {
    try {
      const response = await fetch(`https://api.usdiary.site/diaries/${diary.diary_id}`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        console.log('삭제 완료');
        navigate('/mypage/myRate');
        // 삭제 후 처리 (예: 목록으로 돌아가기)
      } else {
        console.error('Error deleting diary');
      }
    } catch (error) {
      console.error("Error deleting diary:", error);
    }
  };

  return (
    <div className="sea__diary">
      <div className='seaDiary_top'>
        <img src={sea} className="sea__diary-image" alt="sea" />
        <div className="sea__diary-title">Today's Sea</div>
      </div>
      <div className="sea__diary-date">
        <DateSelector
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          theme="sea"
        />
      </div>
      <div className="sea__diary-title-edit">
        <input
          type="text"
          value={diary_title || ''}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={diaryData ? diaryData.diary_title : "제목"}
          className="sea__diary-title-edit-input"
          spellCheck={false}
          readOnly={!!diary && !isEditing}
        />
      </div>
      <div className="sea__diary-another">
        <RevealOptions selectedDiv={access_level} onDivClick={handleDivClick} />
        {!diary && (
          <div className="sea__diary-another-submit" onClick={handleSubmit}>발행</div>
        )}
        {diary && (
          <>
            {isEditing ? (
              <div className="sea__diary-another-submit" onClick={handleUpdate}>수정 완료</div>
            ) : (
              <DropdownMenu onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </>
        )}
      </div>
      <div className="sea__diary-texts">
        {isEditing || !diary ? (
          <Editor
            toolbarItems={[['heading', 'bold', 'italic', 'strike'], ['image', 'link']]}
            height="100%"
            initialEditType="wysiwyg"
            initialValue={diary ? diary.diary_content : ''} // 다이어리 내용이 없을 경우 빈 문자열
            ref={editorRef}
            onChange={onChangeGetHTML}
            addImageBlobHook={addImageBlobHook}
            hideModeSwitch={true}
          />
        ) : (
          <Viewer
            initialValue={`<div style="padding: 20px; font-size: large;">${diary ? diary.diary_content : ''}</div>`} // 다이어리 데이터가 있을 때 Viewer로 내용만 표시
          />
        )}
      </div>
    </div>
  );
};

export default SeaComponent;
