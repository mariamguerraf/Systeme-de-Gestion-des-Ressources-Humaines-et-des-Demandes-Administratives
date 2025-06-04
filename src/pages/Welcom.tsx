
import React from 'react';

const Welcom = () => {
  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      {/* Left side with image */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
          alt="Beautiful landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-500/20"></div>
      </div>

      {/* Right side with form */}
      <div className="w-full  relative p-4 flex items-center justify-center">

        <div className="z-10 flex flex-col items-center space-y-6 w-full max-w-md animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Welcom Page</h1>
            <p className="text-slate-500">We are happy to se you with us.</p>
          </div>


          <div className="text-center text-xs text-slate-400 mt-8">
            <div className="flex justify-center space-x-4 mt-2">
              <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Help</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcom;
