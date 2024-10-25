import React from 'react';

const HomePage = () => {
  return (
    <div
      className="w-full h-screen relative"
      style={{
        backgroundImage: `url("/assets/bg1.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Add blur effect to the background image */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(8px)", // Adjust the blur amount
          WebkitBackdropFilter: "blur(8px)",
        }}
      ></div>

      {/* MARTZ header */}
      <div className="flex items-center justify-center h-full">
        <h1 className="text-white text-6xl font-extrabold z-10">MARTZ</h1>
      </div>
    </div>
  );
};

export default HomePage;



