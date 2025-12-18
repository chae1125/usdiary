import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/dropdownMenu.css'; // CSS 파일 가져오기

const DropdownMenu = ({ onEdit, onDelete }) => {
  const [view, setView] = useState(false);
  const dropdownRef = useRef(null);

  // 클릭 시 드롭다운 외부를 클릭하면 닫히게 하기 위한 효과
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setView(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <ul
        onClick={() => { setView(!view) }}
        className="dropdown-trigger">
        ⋮
      </ul>

      {view && (
        <div className="dropdown-menu">
          <div
            className="dropdown-item"
            onClick={onEdit}
          >
            일기 수정하기
          </div>
          <div
            className="dropdown-item"
            onClick={onDelete}
          >
            일기 삭제하기
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
