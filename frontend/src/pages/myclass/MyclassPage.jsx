import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import Classcard from '../../components/common/Classcard';
import toast from "react-hot-toast";

const MyclassPage = () => {
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

  // Fetch user data first
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    }
  });

  // Fetch clusters data, but only if userData is present
  const { data: clusters, isLoading: isClusterLoading, error: clusterError } = useQuery({
    queryKey: ['clusters'],
    queryFn: async () => {
      const res = await fetch("/api/clusters");
      if (!res.ok) throw new Error("Failed to fetch clusters");
      return res.json();
    },
    enabled: !!userData,  // Only run this query if userData is present
  });

  // Handle loading and error states first
  if (isUserLoading || isClusterLoading) return <div className="h-screen flex justify-center items-center">Loading...</div>;
  if (userError || clusterError) return <div>Error: {userError?.message || clusterError?.message}</div>;

  // Now handle the case where no classes are found
  if (!userData.inCluster || userData.inCluster.length === 0) {
    return <div className="p-4 text-xl text-center w-full">您当前还没有加入任何班级。</div>;
  }

  // Filter and sort user classes
  const userClasses = clusters?.data
    ?.filter(cluster => userData.inCluster.includes(cluster._id))
    ?.sort((a, b) => a.name.localeCompare(b.name)); // Sort classes alphabetically by name

  // Final JSX to render the page
  return (
    <div className="w-full p-8">
      <div className="w-full pt-8">
        <h1 className="text-2xl font-bold">我的班级</h1>
      </div>
      
      <div className="flex flex-wrap p-4">
        {userClasses.length > 0 ? (
          <>
            {userClasses.map((classItem) => (
              <Classcard 
                key={classItem._id} 
                title={classItem.name} 
                imageUrl="../assets/Banana.jpg"
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
