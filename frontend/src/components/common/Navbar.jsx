import React, { useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation(); // Get the current location (path)

  const handlePageClick = (path) => {
    if (location.pathname === path) {
      // If the clicked page is the current page, reload the page
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

    // Cleanup event listener
    return () => {
      drawerInput.removeEventListener("change", handleDrawerChange);
    };
  }, []);

  return (
    <div className="navbar bg-base-100">
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

      <div className="flex-1">
        <Link to='/'><a className="btn btn-ghost text-xl">Martz</a></Link>
      </div>

      <div className="flex gap-1">
        <div className="dropdown dropdown-bottom dropdown-end">
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
        </div>

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
            <li><a>我的账户</a></li>
            <li><Link to="/login">登出</Link></li>
          </ul>
        </details>
      </div>

      {/* Drawer side */}
      <div className="drawer-side z-50">
        <label htmlFor="my-drawer" className="drawer-overlay" style={{ zIndex: 50 }}></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-40 p-4" style={{ zIndex: 50 }}>
          {/* Drawer content */}
          <li>
            <Link to="/myclass" onClick={() => handlePageClick('/myclass')}>
              我的班级
            </Link>
          </li>
          <li>
            <Link to="/calendar" onClick={() => handlePageClick('/calendar')}>
              小玛宝历
            </Link>
          </li>
          <li>
            <Link to="/page3" onClick={() => handlePageClick('/page3')}>
              Page3
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;



