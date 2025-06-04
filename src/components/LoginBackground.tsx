
import React from 'react';

const LoginBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50 to-transparent"></div>
      
      {/* Floating circles */}
      <div className="absolute top-16 right-16 w-64 h-64 rounded-full bg-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-16 right-1/3 w-80 h-80 rounded-full bg-indigo-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-50 to-transparent"></div>
    </div>
  );
};

export default LoginBackground;
