import { Navigate, Route } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Signup from '../pages/Signup'
import Navbar from '../components/common/Navbar'  
import Login from '../pages/Login'
import ForgotPassword from '../pages/ForgotPassword'
import About from '../pages/About'

// import './App.css'

function App() {
  return (
    <>
      <div className='flex min-h-screen w-screen flex-col bg-richblack-900 font-inter'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Home />} />
          <Route path='/dashboard' element={<Home />} />
          <Route path='/catalog/:catalogName' element={<Home />} />
          <Route path='/courses/:courseId' element={<Home />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </div>
    </>
  )
}

export default App
