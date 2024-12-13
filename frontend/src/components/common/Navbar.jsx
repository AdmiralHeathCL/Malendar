import React, { useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Navbar = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "出错啦~");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("注销成功");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const handlePageClick = (path) => {
    if (location.pathname === path) {
      window.location.reload();
    }
  };

  useEffect(() => {
    const drawerInput = document.getElementById("my-drawer");

    const handleDrawerChange = () => {
      if (drawerInput.checked) {
        document.body.classList.add("drawer-open");
      } else {
        document.body.classList.remove("drawer-open");
      }
    };

    drawerInput.addEventListener("change", handleDrawerChange);

    return () => {
      drawerInput.removeEventListener("change", handleDrawerChange);
    };
  }, []);

  // Check if the current path is the homepage
  const isHomepage = location.pathname === '/';

  return (
    <div className={`navbar ${isHomepage ? 'bg-transparent' : 'bg-base-100'} fixed top-0 left-0 w-full z-50`}>
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      <div className="flex-none">
        <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-5 w-5 stroke-current">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </label>
      </div>

      <div className="flex-1 flex items-center">
        <Link to='/'>
          <a className="btn btn-ghost text-2xl font-extrabold">Martz</a>
        </Link>
        {authUser?.usertype === "isAdmin" && (
          <span className="ml-0 px-2 py-0.5 rounded bg-yellow-600 text-white text-[0.75rem] font-semibold">
            管理员
          </span>
        )}
        {authUser?.usertype === "isTeacher" && (
          <span className="ml-0 px-2 py-0.5 rounded text-white text-[0.75rem] font-semibold" style={{ backgroundColor: '#348bd2' }}>
            教师
          </span>
        )}
        {authUser?.usertype === "isStudent" && (
          <span className="ml-0 px-2 py-0.5 rounded text-white text-[0.75rem] font-semibold" style={{ backgroundColor: '#348bd2' }}>
            学员
          </span>
        )}
      </div>

      <div className="flex gap-1">
        {/* Notifications */}
        {/* <div className="dropdown dropdown-bottom dropdown-end">
          <div tabIndex="0" role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </div>
          <div
            tabIndex="0"
            className="dropdown-content card card-compact bg-primary text-primary-content z-[1] w-64 p-2 shadow">
            <div className="card-body">
              <h3 className="card-title">通知</h3>
              <p>Work in Progress</p>
            </div>
          </div>
        </div> */}

        {/* Account Dropdown */}
        <details className="dropdown dropdown-bottom dropdown-end">
          <summary className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
          </summary>
          <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-36 p-2 shadow">
            <li>
              <Link to="/myinfo" onClick={() => handlePageClick('/myinfo')}>
                我的账户
              </Link>
            </li>
            <li><Link to="/login" onClick={(e) => {
              e.preventDefault();
              logout();
            }}>登出</Link></li>
          </ul>
        </details>
      </div>

      {/* Drawer side */}
      <div className="drawer-side z-50">
        <label htmlFor="my-drawer" className="drawer-overlay" style={{ zIndex: 50 }}></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-40 p-4" style={{ zIndex: 50 }}>
          <li>
            <Link to="/calendar" onClick={() => handlePageClick('/calendar')}>
              小玛宝历
            </Link>
          </li>
          <li>
            {authUser?.usertype === "isAdmin" ? (
              <Link to="/allclass" onClick={() => handlePageClick('/allclass')}>
                所有班级
              </Link>
            ) : (
              <Link to="/myclass" onClick={() => handlePageClick('/myclass')}>
                我的班级
              </Link>
            )}
          </li>
          
          {authUser?.usertype === "isAdmin" && (
            <li>
              <Link to="/manage" onClick={() => handlePageClick('/manage')}>
                课程安排
              </Link>
            </li>
          )}

          {authUser?.usertype === "isAdmin" && (
            <li>
              <Link to="/users" onClick={() => handlePageClick('/users')}>
                成员列表
              </Link>
            </li>
          )}

        </ul>
      </div>
    </div>
  );
};

export default Navbar;





