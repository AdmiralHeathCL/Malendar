import React from 'react';
import Classcard from '../../components/common/Classcard';
import Navbar from '../../components/common/Navbar';

const MyclassPage = () => {
  // Sample data for classes
  const classes = [
    { id: 1, title: '雅思强化101', imageUrl: '../assets/Banana.jpg' },
    { id: 2, title: '雅思强化102', imageUrl: '../assets/Banana.jpg' },
    { id: 3, title: '雅思强化103', imageUrl: '../assets/Banana.jpg' },
  ];

  return (
    <div className="w-full">
      <Navbar />
      <div className="flex flex-wrap p-4"> 
        {classes.map((classItem, index) => (
          <Classcard key={index} title={classItem.title} imageUrl={classItem.imageUrl} />
        ))}
      </div>
    </div>
  );
};

export default MyclassPage;

