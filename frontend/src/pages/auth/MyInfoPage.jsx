import React from "react";
import { useQuery } from "@tanstack/react-query";

const MyInfoPage = () => {
  // Fetch authenticated user
  const { data: authUser, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading user info...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { username, usertype, profileImg } = authUser;

  // Use profileImg for background color
  const profileBgColor = profileImg || "#a8dadc";  // Fallback to a default color

  return (
    <div className="w-full p-8">
      <h1 className="text-2xl font-bold mb-6">我的信息</h1>

      {/* User Info Section */}
      <div className="bg-base-200 p-6 rounded-lg shadow mb-3 flex items-center gap-6">
        {/* Profile Picture */}
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300"
          style={{ backgroundColor: profileBgColor }}
        >
          <span className="text-white text-xl font-bold w-full h-full flex items-center justify-center">
            {username[0]}
          </span>
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
