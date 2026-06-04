import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import { useEffect } from "react";

function App() {
  useEffect(() => {
  const browserLang = navigator.language || navigator.userLanguage;

  let targetLang = "en";

  if (browserLang.startsWith("de")) {
    targetLang = "de";
  } else if (browserLang.startsWith("fr")) {
    targetLang = "fr";
  } else if (browserLang.startsWith("ar")) {
    targetLang = "ar";
  }

  document.cookie = `googtrans=/en/${targetLang}; path=/`;
}, []);
  return (
    <Router>
      <Routes>    
        <Route path="/" element={<Navigate to="/login" replace />} />   
        <Route path='/login' element={<Login/>}/>
        <Route path='/account' element={<Account/>}/>
        <Route path="*" element={<NotFound />} />


      </Routes>
    </Router>
  );
}

export default App;
