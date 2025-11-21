import React, { useEffect, useRef } from 'react';

interface LoginProps {
  onLoginSuccess: (credentialResponse: any) => void;
  companyName: string;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, companyName }) => {
  const signInDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        // The Google Client ID is expected to be provided as an environment variable.
        client_id: process.env.GOOGLE_CLIENT_ID,
        callback: onLoginSuccess
      });
      if(signInDivRef.current) {
        (window as any).google.accounts.id.renderButton(
          signInDivRef.current,
          { theme: "outline", size: "large", text: "continue_with", shape: "rectangular" }
        );
      }
      (window as any).google.accounts.id.prompt();
    }
  }, [onLoginSuccess]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-12 rounded-lg shadow-xl text-center animate-fade-in-up">
        <h1 className="text-4xl font-bold text-red-600 mb-4">{companyName}</h1>
        <p className="text-gray-600 mb-8">Sistema de Orçamentos Pro</p>
        <div ref={signInDivRef} className="flex justify-center"></div>
      </div>
    </div>
  );
};

export default Login;