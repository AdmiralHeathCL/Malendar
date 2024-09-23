import { Route, Routes } from "react-router-dom"

function App() {
  return (
		<div className='flex max-w-6xl mx-auto'>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/login' element={<LoginPage />} />
			</Routes>
		</div>
  )
}

export default App