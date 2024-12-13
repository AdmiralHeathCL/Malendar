import React from "react";
import { useQuery } from "@tanstack/react-query";

const MyInfoPage = () => {
  // Fetch authenticated user
  const { data: authUser, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading user info...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { username, usertype } = authUser;

  // Define the color pool for profile picture backgrounds
  const colorPool = [
    "#a8dadc", // Light teal
    "#ff9f9f", // Light red
    "#9acbff", // Light blue
    "#ffcc88", // Light orange
    "#f4e1a1", // Pale yellow
    "#d8b7d1", // Light purple
    "#d7b0f7", // Soft lavender
    "#e5d1b4", // Light beige
    "#a6c1e1", // Light sky blue
    "#ffbdbd", // Light pink
  ];

  // Function to randomly pick a background color from the color pool
  const generateBgColor = () => {
    const randomIndex = Math.floor(Math.random() * colorPool.length);
    return encodeURIComponent(colorPool[randomIndex]); // Ensure the color is URL-encoded
  };

  // Default profile image based on first letter of the username
  const defaultProfileImg = `https://ui-avatars.com/api/?name=${username[0]}&background=${generateBgColor()}&color=fff&size=128`;

  return (
    <div className="w-full p-8">
      <h1 className="text-2xl font-bold mb-6">我的信息</h1>

      {/* User Info Section */}
      <div className="bg-base-200 p-6 rounded-lg shadow mb-3 flex items-center gap-6">
        {/* Profile Picture */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
          <img
            src={defaultProfileImg} // Default profile image based on first letter and random background color
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">用户信息</h2>
          <p>
            <strong>用户名:</strong> {username}
          </p>
          <p>
            <strong>用户类型:</strong>{" "}
            {usertype === "isAdmin"
              ? "管理员"
              : usertype === "isTeacher"
              ? "教师"
              : "学员"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyInfoPage;
