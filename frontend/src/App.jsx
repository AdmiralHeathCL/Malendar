import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import CalendarPage from "./pages/calendar/CalendarPage";
import AdminCalendarPage from "./pages/calendar/AdminCalendarPage";
import MyclassPage from "./pages/myclass/MyclassPage";
import ClassDetailPage from "./pages/myclass/ClassdetailPage";
import { Toaster } from "react-hot-toast";
// import Navbar from "./components/common/Navbar";

function App() {
  return (
    <div className='flex max-w-6xl mx-auto'>
      {/* <Navbar /> */}
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/calendar' element={<CalendarPage />} />
        <Route path='/myclass' element={<MyclassPage />} />
        <Route path='/myclass/:id' element={<ClassDetailPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignUpPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
