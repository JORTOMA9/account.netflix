import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Account from './pages/Account';
import NotFound from './pages/NotFound';


function App() {
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