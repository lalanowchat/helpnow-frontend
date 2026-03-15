import { BrowserRouter, Routes, Route } from 'react-router-dom'

import NeedHelp from './pages/NeedHelp'
import WantToHelp from './pages/WantToHelp'
import ChatWithLala from './pages/ChatWithLala'
import Home from './pages/Home'
import MainPage from './pages/MainPage'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/need-help" element={<NeedHelp />} />
        <Route path="/want-to-help" element={<WantToHelp />} />
        <Route path="/chat" element={<ChatWithLala />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
