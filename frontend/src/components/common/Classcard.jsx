import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiFillDelete } from "react-icons/ai"; // Import the delete icon

const Classcard = ({ title, imageUrl, classId, isActive, handleToggleActive, userType, handleDelete }) => {
  const navigate = useNavigate();

  const handleEnterClass = () => {
    navigate(`/myclass/${classId}`); // Navigates when card is clicked
  };

  const confirmDelete = () => {
    if (window.confirm("确定要删除此班级吗？此操作不可撤销。")) {
      handleDelete(classId); // Call the delete function passed from parent
    }
  };

  return (
    <div
      className={`card bg-base-100 w-40 shadow-md m-2 cursor-pointer transition-transform duration-300 
      ${userType === 'isAdmin' && !isActive ? 'bg-gray-400' : ''} hover:shadow-lg hover:scale-105`} // Only apply grey when user is admin and class is inactive
      onClick={handleEnterClass} // Entire card is clickable
    >
      <figure className="relative">
        <img
          src={imageUrl}
          alt="ClassImg"
          className={`h-24 w-full object-cover ${userType === 'isAdmin' && !isActive ? 'grayscale' : ''}`} // Only apply grayscale for admins
        />
      </figure>
      <div className="card-body p-2 flex flex-col justify-between">
        <h2 className="card-title text-sm">{title}</h2>
        <p>TEST</p>
        <div className="card-actions justify-end items-end flex flex-col">
          {userType === 'isAdmin' && (
            <div className="flex justify-end items-end space-x-2 mt-4">
              <label
                className="flex items-center text-xs"
                onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking the checkbox
              >
                <input
                  type="checkbox"
                  checked={!isActive}
                  onChange={(e) => {
                    e.stopPropagation(); // Prevents click on checkbox from navigating
                    handleToggleActive();
                  }}
                  className="mr-1 h-3 w-3" // Smaller checkbox
                />
                隐藏
              </label>
              <div
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the click event from triggering navigation
                  confirmDelete();
                }}
                className="cursor-pointer hover:text-[#c4aa42] hover:scale-110 transition-transform duration-200"
                title="删除班级"
              >
                <AiFillDelete className="text-[#c4aa42] h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Classcard;

