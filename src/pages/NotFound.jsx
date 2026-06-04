import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="relative min-h-screen bg-black flex flex-col font-['Helvetica_Neue',Helvetica,Arial,sans-serif]"
      style={{ 
        backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/pages/errors/bg-lost-in-space.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Navbar خفيفة */}
      <header className="absolute top-0 left-0 w-full flex items-center justify-between px-[4%] py-5 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" 
          alt="Netflix" 
          className="w-[100px] md:w-[130px] cursor-pointer" 
          onClick={() => navigate('/')} 
        />
      </header>

      {/* الضبابة باش يبان التيكست مزيان */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* المحتوى ديال 404 */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 mt-10">
        <h1 className="text-white text-[40px] md:text-[64px] font-bold mb-6 drop-shadow-2xl">
          Lost your way?
        </h1>
        
        <p className="text-white text-[18px] md:text-[24px] font-light mb-8 max-w-[600px] drop-shadow-lg leading-relaxed">
          Sorry, we can't find that page. You'll find lots to explore on the home page.
        </p>
        
        <button 
          onClick={() => navigate('/')}
          className="bg-white text-black px-8 py-3 rounded-[4px] font-bold text-[18px] md:text-[20px] hover:bg-gray-200 transition shadow-lg"
        >
          Netflix Home
        </button>

        {/* كود الإيرور بـ ستايل نيتفليكس */}
        <div className="mt-16 flex flex-row items-center gap-3 border-l-2 border-[#e50914] pl-4 text-left">
          <span className="text-gray-200 text-[20px] font-light tracking-wide">Error Code</span>
          <span className="text-white text-[20px] font-bold tracking-widest">NSES-404</span>
        </div>
      </main>
      
      <div className="absolute bottom-6 right-8 z-10 text-gray-400 text-[13px] font-light hidden md:block">
        FROM <strong>LOST IN SPACE</strong>
      </div>
    </div>
  );
};

export default NotFound;