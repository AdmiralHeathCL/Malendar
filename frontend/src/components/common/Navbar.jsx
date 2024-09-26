import React from 'react'
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100">

        <details className="dropdown flex-none">
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
                d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </summary>
        <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-40 p-2 shadow">
            <li>
                <Link to='/calendar'><a>小玛宝历</a></Link>
            </li>
            <li>
                <Link to='/myclass'><a>我的班级</a></Link>
            </li>
        </ul>
        </details>

        <div className="flex-1">
            <Link to='/'>
                <a className="btn btn-ghost text-xl">Martz</a>
            </Link>
        </div>

        <div className="flex gap-1">
            <div class="dropdown dropdown-bottom dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                <div class="indicator">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span class="badge badge-xs badge-primary indicator-item"></span>
                </div>
                </div>
                <div
                tabindex="0"
                class="dropdown-content card card-compact bg-primary text-primary-content z-[1] w-64 p-2 shadow">
                <div class="card-body">
                    <h3 class="card-title">通知</h3>
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

    </div>
  );
};

export default Navbar;