import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import CalendarPage from "./pages/calendar/CalendarPage";
import AdminCalendarPage from "./pages/calendar/AdminCalendarPage";
import MyclassPage from "./pages/myclass/MyclassPage";
import ClassDetailPage from "./pages/myclass/ClassdetailPage";
import CreateClassPage from "./pages/admin/CreateClassPage";
import AllclassPage from "./pages/admin/AllclassPage";
import Navbar from "./components/common/Navbar";
import AdminRoute from "./pages/admin/AdminRoute";
import MyInfoPage from "./pages/auth/MyInfoPage";
import AdminUserPage from "./pages/admin/AdminUserPage";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  const isAdmin = authUser?.usertype === "isAdmin";

  return (
    <div style={{ minWidth: "600px", overflowX: "auto" }}>
      {authUser && <Navbar className="w-full fixed top-0 left-0" />}
      <div className="flex w-full mx-auto">
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/calendar"
            element={authUser ? <CalendarPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/myclass"
            element={authUser ? <MyclassPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/myclass/:id"
            element={authUser ? <ClassDetailPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/myinfo"
            element={authUser ? <MyInfoPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/manage"
            element={
              <AdminRoute authUser={authUser}>
                <AdminCalendarPage />
              </AdminRoute>
            }
          />

          <Route
            path="/users"
            element={
              <AdminRoute authUser={authUser}>
                <AdminUserPage />
              </AdminRoute>
            }
          />

          <Route
            path="/allclass"
            element={
              <AdminRoute authUser={authUser}>
                <AllclassPage />
              </AdminRoute>
            }
          />

          <Route
            path="/createclass"
            element={
              <AdminRoute authUser={authUser}>
                <CreateClassPage />
              </AdminRoute>
            }
          />

          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : isAdmin ? <Navigate to="/users" /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : isAdmin ? <Navigate to="/users" /> : <Navigate to="/" />}
          />
        </Routes>
        <Toaster />
      </div>
    </div>
  );
}

export default App;
