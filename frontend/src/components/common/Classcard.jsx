import React from 'react';
import { useNavigate } from 'react-router-dom';

const Classcard = ({ title, imageUrl, classId }) => {
  const navigate = useNavigate();

  const handleEnterClass = () => {
    // Navigate to the class route based on classId
    navigate(`/myclass/${classId}`);
  };

  return (
    <div className="card bg-base-100 w-40 shadow-md m-2">
      <figure>
        <img src={imageUrl} alt="ClassImg" className="h-24 w-full object-cover" />
      </figure>
      <div className="card-body p-2">
        <h2 className="card-title text-sm">{title}</h2>
        <p>TEST</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-sm" onClick={handleEnterClass}>
            进入班级
          </button>
        </div>
      </div>
    </div>
  );
};

export default Classcard;


