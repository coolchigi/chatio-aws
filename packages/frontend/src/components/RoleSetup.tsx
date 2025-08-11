import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// hello
const RoleSetup: React.FC = () => {
  const [roleArnInput, setRoleArnInput] = useState('');
  const { 
    isConnected, 
    isLoading, 
    error, 
    roleArn,
    sessionId,
    connectToRole,
    disconnect,
    clearError,
    getTimeUntilExpiry
  } = useAuth();

  const validateRoleArn = (arn: string): boolean => {
    const arnRegex = /^arn:aws:iam::\d{12}:role\/[\w+=,.@-]+$/;
    return arnRegex.test(arn.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleArnInput.trim()) return;
    
    if (!validateRoleArn(roleArnInput)) {
      return;
    }

    await connectToRole(roleArnInput);
  };

  const handleDisconnect = async () => {
    await disconnect();
    setRoleArnInput('');
  };

  const formatTimeUntilExpiry = () => {
    const timeLeft = getTimeUntilExpiry();
    if (!timeLeft) return '';
    
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Connected state
  if (isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-emerald-900">
                Connected to AWS
              </h3>
            </div>
            
            {/* Connection info */}
            <div className="bg-white/80 rounded-xl p-6 mb-6 border border-emerald-100">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm font-medium text-slate-600 shrink-0">Role:</span>
                  <span className="text-sm font-mono text-slate-800 text-right break-all">
                    {roleArn}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Session:</span>
                  <span className="text-sm font-mono text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
                    {sessionId?.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Expires in:</span>
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-md">
                    {formatTimeUntilExpiry()}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-emerald-700 text-center mb-6 font-medium">
              You can now upload PDFs and create knowledge bases.
            </p>
            
            <button 
              onClick={handleDisconnect}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connection form
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              Connect to Your AWS Account
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Enter your IAM role ARN to securely connect to AWS services.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                IAM Role ARN
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={roleArnInput}
                  onChange={(e) => setRoleArnInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                  placeholder="arn:aws:iam::123456789012:role/ChatPDFRole"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                    isLoading 
                      ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
                      : roleArnInput && !validateRoleArn(roleArnInput)
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-slate-300 focus:border-blue-500 bg-white'
                  }`}
                />
                {roleArnInput && validateRoleArn(roleArnInput) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-100 rounded-full p-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {roleArnInput && !validateRoleArn(roleArnInput) && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Invalid role ARN format
                </p>
              )}
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isLoading || !roleArnInput.trim() || !validateRoleArn(roleArnInput)}
              className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
                isLoading || !roleArnInput.trim() || !validateRoleArn(roleArnInput)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect to AWS</span>
              )}
            </button>
          </div>
        </div>

        {/* Error Modal */}
        {error && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-red-600">Connection Failed</h4>
              </div>
              
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm leading-relaxed">
                  {error}
                </p>
              </div>
              
              <button 
                onClick={clearError} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSetup;