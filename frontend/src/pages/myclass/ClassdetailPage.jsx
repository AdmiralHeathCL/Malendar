import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';

const ClassDetailPage = () => {
  const { id } = useParams(); // Get the dynamic class id from the URL

  return (
    <div className="w-full">
      <Navbar />
      <div className="p-4">
        <h1 className="text-2xl font-bold">Class Details for Class ID: {id}</h1>
      </div>
    </div>
  );
};

export default ClassDetailPage;
