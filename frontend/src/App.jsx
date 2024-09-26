import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/home/HomePage"
import LoginPage from "./pages/auth/login/LoginPage"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import CalendarPage from "./pages/calendar/CalendarPage"
import AdminCalendarPage from "./pages/calendar/AdminCalendarPage"
import MyclassPage from "./pages/myclass/MyclassPage"

function App() {
  return (
		<div className='flex max-w-6xl mx-auto'>
			<Routes>
				<Route path='/' element={<HomePage />} />
				{/* <Route path='/admin/calendar' element={<AdminCalendarPage />} /> */}
				<Route path='/calendar' element={<CalendarPage />} />
				<Route path='/myclass' element={<MyclassPage />} />
				<Route path='/login' element={<LoginPage />} />
        		<Route path='/signup' element={<SignUpPage />} />
			</Routes>
		</div>
  )
}

export default App;