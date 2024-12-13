import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const AdminUserPage = () => {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("isStudent"); // Default usertype
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMethod, setSortMethod] = useState("usertype");

  // Fetch all users
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users/all");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async ({ username, password, usertype }) => {
      const res = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, usertype }),
        credentials: "omit", // Prevent modifying admin session cookies
      });
      if (!res.ok) throw new Error("Failed to create user");
    },
    onSuccess: () => {
      toast.success("用户创建成功");
      queryClient.invalidateQueries(["users"]);
      setUsername("");
      setPassword("");
      setUsertype("isStudent"); // Reset to default usertype
    },
    onError: () => {
      toast.error("用户创建失败");
    },
  });

  // Delete user mutation using removeUserById
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      toast.success("用户删除成功");
      queryClient.invalidateQueries(["users"]);
    },
    onError: () => {
      toast.error("删除用户失败");
    },
  });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>用户加载错误</div>;

  // Sort users based on sort method
  const sortedUsers = [...(usersData?.data || [])].sort((a, b) => {
    if (sortMethod === "usertype") {
      return a.usertype.localeCompare(b.usertype);
    } else if (sortMethod === "registration") {
      return new Date(a.registerDate) - new Date(b.registerDate);
    }
    return 0;
  });

  // Map usertype to Chinese
  const userTypeMap = {
    isStudent: "学生",
    isTeacher: "教师",
    isAdmin: "管理员",
  };

  return (
    <div className="w-full p-8">
      <h1 className="text-2xl font-bold mb-4">用户管理</h1>

      {/* Create User Section */}
      <div className="bg-base-200 p-4 rounded shadow-md mb-6">
        <h2 className="text-xl font-medium mb-2">创建用户</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            className="input input-bordered"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="input input-bordered"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            className="select select-bordered"
            value={usertype}
            onChange={(e) => setUsertype(e.target.value)}
          >
            <option value="isStudent">学生</option>
            <option value="isTeacher">教师</option>
            <option value="isAdmin">管理员</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={() =>
              createUserMutation.mutate({ username, password, usertype })
            }
          >
            创建用户
          </button>
        </div>
      </div>

      {/* User List Section */}
      <div className="bg-base-200 p-4 rounded shadow-md">
        <h2 className="text-xl font-medium mb-2">用户列表</h2>
        <input
          type="text"
          className="input input-bordered mb-4"
          placeholder="搜索用户"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="mb-4">
          <label className="mr-2">排序:</label>
          <select
            className="select select-bordered select-sm"
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value)}
          >
            <option value="usertype">按用户类型排序</option>
            <option value="registration">按注册时间排序</option>
          </select>
        </div>
        <div className="overflow-auto" style={{ maxHeight: "400px" }}>
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>用户名</th>
                <th>注册时间</th>
                <th>用户类型</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers
                .filter((user) =>
                  user.username.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{new Date(user.registerDate).toLocaleDateString()}</td>
                    <td>{userTypeMap[user.usertype] || user.usertype}</td> {/* Display usertype in Chinese */}
                    <td>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => deleteUserMutation.mutate(user._id)} // Pass user ID to the mutation
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserPage;
