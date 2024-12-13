import { Link } from "react-router-dom";
import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: async ({ username, password }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "账户创建失败");
      return data;
    },
    onSuccess: async () => {
      toast.success("账户创建成功");
      await loginMutation.mutateAsync(formData); // Trigger automatic login
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("账户创建失败");
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登录失败");
      return data;
    },
    onSuccess: () => {
      toast.success("登录成功");
    },
    onError: () => {
      toast.error("登录失败");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error("用户名和密码不能为空");
      return;
    }
    signupMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <img src="/assets/martz_svg.png" alt="Martz Logo" className="lg:w-2/3" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <img src="/assets/martz_svg.png" alt="Martz Logo" className="w-24 lg:hidden" />
          <h1 className="text-4xl font-extrabold text-white">{"加入"} 玛尔兹。</h1>

          <label className="input input-bordered rounded flex items-center gap-2 flex-1">
            <FaUser />
            <input
              type="text"
              className="grow"
              placeholder="用户名"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="密码"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>

          <button className="btn rounded-full btn-primary text-white">
            {signupMutation.isLoading ? "Loading..." : "注册账号"}
          </button>
          {signupMutation.isError && (
            <p className="text-red-500">{signupMutation.error.message}</p>
          )}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">已有账号？</p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              登录账号
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
