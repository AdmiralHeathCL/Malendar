import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import Classcard from '../../components/common/Classcard';
import toast from "react-hot-toast";

const MyclassPage = () => {
  const [showAll, setShowAll] = useState(false); // State to control show all or limited view
  const [cardsPerRow, setCardsPerRow] = useState(3); // State to track how many cards fit in one row

  // Function to calculate how many cards fit in a row
  const calculateCardsPerRow = () => {
    const cardWidth = 180; // Approximate width of each card (can be adjusted)
    const containerWidth = window.innerWidth - 64; // Calculate container width minus padding
    const cardsPerRow = Math.floor(containerWidth / cardWidth);
    setCardsPerRow(cardsPerRow > 0 ? cardsPerRow : 1); // Ensure at least 1 card is shown per row
  };

  useEffect(() => {
    // Calculate the number of cards per row on load
    calculateCardsPerRow();

    // Recalculate when window is resized
    window.addEventListener('resize', calculateCardsPerRow);

    return () => {
      window.removeEventListener('resize', calculateCardsPerRow);
    };
  }, []);

  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    }
  });

  if (isUserLoading) return <div className="h-screen flex justify-center items-center">Loading user data...</div>;
  if (userError) return <div>Error: {userError.message}</div>;

  const { data: clusters, isLoading: isClusterLoading, error: clusterError } = useQuery({
    queryKey: ['clusters'],
    queryFn: async () => {
      const res = await fetch("/api/clusters");
      if (!res.ok) throw new Error("Failed to fetch clusters");
      return res.json();
    },
    enabled: !!userData, 
  });

  if (isClusterLoading) return <div>Loading classes...</div>;
  if (clusterError) return <div>Error: {clusterError.message}</div>;

  if (!userData.inCluster || userData.inCluster.length === 0) {
    return <div className="p-4 text-xl text-center w-full">您当前还没有加入任何班级。</div>;
  }

  const userClasses = clusters?.data?.filter(cluster => userData.inCluster.includes(cluster._id));

  // Calculate how many rows to show initially based on cardsPerRow
  const initialCardsToShow = showAll ? userClasses.length : cardsPerRow;

  return (
    <div className="w-full">
      <div className="p-4">
        <h1 className="text-2xl font-bold">我的班级</h1>
      </div>
      <div className="flex justify-center mb-4">
        {userClasses.length > cardsPerRow && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "显示更少" : "显示所有"}
          </button>
        )}
      </div>
      
      {/* Display class cards in a flex container */}
      <div className="flex flex-wrap p-4">
        {userClasses.length > 0 ? (
          <>
            {/* Show limited number of class cards if showAll is false, else show all */}
            {userClasses.slice(0, initialCardsToShow).map((classItem) => (
              <Classcard 
                key={classItem._id} 
                title={classItem.name} 
                imageUrl="../assets/Banana.jpg"  // Replace with actual image URL if available
                classId={classItem._id}
              />
            ))}
          </>
        ) : (
          <div className="p-4 text-xl text-center w-full">您当前还没有加入任何班级。</div>
        )}
      </div>
    </div>
  );
};

export default MyclassPage;

