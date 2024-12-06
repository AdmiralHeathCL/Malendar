import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const MyInfoPage = () => {
  const [daysInMartz, setDaysInMartz] = useState(0);

  // Fetch authenticated user
  const { data: authUser, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    },
    onSuccess: (user) => {
      if (user && user.registerDate) {
        const registerDate = new Date(user.registerDate);
        const today = new Date();
        const diffTime = Math.abs(today - registerDate);
        setDaysInMartz(Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Calculate days in Martz
      }
    },
  });

  // Reset Password Mutation
  const resetPassword = useMutation({
    mutationFn: async (email) => {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to reset password");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Password reset email sent!");
    },
    onError: () => {
      toast.error("Failed to reset password");
    },
  });

  const handleResetPassword = () => {
    const email = prompt("请输入您的邮箱地址以重置密码:");
    if (email) {
      resetPassword.mutate(email);
    }
  };

  if (isLoading) return <div>Loading user info...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { username, usertype } = authUser;

  return (
    <div className="w-full p-8">
      <h1 className="text-2xl font-bold mb-6">我的信息</h1>

      {/* User Info Section */}
      <div className="bg-base-200 p-6 rounded-lg shadow mb-3">
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
        <p>
          <strong>加入时间:</strong> 已加入 Martz {daysInMartz} 天
        </p>
      </div>

      {/* Account Security Section */}
      <div className="bg-base-200 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">账户安全</h2>
        <button
          className="btn btn-warning btn-sm mt-2"
          onClick={handleResetPassword}
        >
          重置密码
        </button>
      </div>
    </div>
  );
};

export default MyInfoPage;
