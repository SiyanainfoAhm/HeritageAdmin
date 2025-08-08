import React, { useState, useEffect, useRef } from 'react';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface OtpFormData {
  email: string;
}

interface ForgotPasswordData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // State for different forms
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false
  });
  
  const [otpForm, setOtpForm] = useState<OtpFormData>({
    email: ''
  });

  const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordData>({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP states
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [forgotOtpValues, setForgotOtpValues] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(45);
  const [forgotOtpTimer, setForgotOtpTimer] = useState(45);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [canResendForgotOtp, setCanResendForgotOtp] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  // Refs for OTP inputs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0 && showOtpModal) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer, showOtpModal]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (forgotOtpTimer > 0 && showForgotPasswordModal && forgotPasswordStep === 2) {
      interval = setInterval(() => {
        setForgotOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendForgotOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [forgotOtpTimer, showForgotPasswordModal, forgotPasswordStep]);

  // Password strength calculation
  useEffect(() => {
    const strength = checkPasswordStrength(forgotPasswordData.newPassword);
    setPasswordStrength(strength);
  }, [forgotPasswordData.newPassword]);

  // Password match check
  useEffect(() => {
    if (forgotPasswordData.confirmPassword) {
      setPasswordMatch(forgotPasswordData.newPassword === forgotPasswordData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [forgotPasswordData.newPassword, forgotPasswordData.confirmPassword]);

  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]+/)) strength += 1;
    return strength;
  };

  const getStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-blue-500';
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'Too weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Medium';
      case 4:
        return 'Strong';
      case 5:
        return 'Very strong';
      default:
        return 'Too weak';
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotOtpChange = (index: number, value: string) => {
    const newOtpValues = [...forgotOtpValues];
    newOtpValues[index] = value;
    setForgotOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      forgotOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !forgotOtpValues[index] && index > 0) {
      forgotOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digits = pasteData.match(/\d/g);
    if (digits) {
      const newOtpValues = [...otpValues];
      for (let i = 0; i < Math.min(digits.length, 6); i++) {
        newOtpValues[i] = digits[i];
      }
      setOtpValues(newOtpValues);
      if (digits.length > 0) {
        otpRefs.current[Math.min(digits.length, 6) - 1]?.focus();
      }
    }
  };

  const handleForgotOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digits = pasteData.match(/\d/g);
    if (digits) {
      const newOtpValues = [...forgotOtpValues];
      for (let i = 0; i < Math.min(digits.length, 6); i++) {
        newOtpValues[i] = digits[i];
      }
      setForgotOtpValues(newOtpValues);
      if (digits.length > 0) {
        forgotOtpRefs.current[Math.min(digits.length, 6) - 1]?.focus();
      }
    }
  };

  const handleRequestOtp = () => {
    setShowOtpModal(true);
    setOtpTimer(45);
    setCanResendOtp(false);
  };

  const handleResendOtp = () => {
    setOtpTimer(45);
    setCanResendOtp(false);
  };

  const handleResendForgotOtp = () => {
    setForgotOtpTimer(45);
    setCanResendForgotOtp(false);
  };

  const handleVerifyOtp = () => {
    const otp = otpValues.join('');
    if (otp.length === 6) {
      alert('OTP verification successful!');
      setShowOtpModal(false);
      setOtpValues(['', '', '', '', '', '']);
    } else {
      alert('Please enter a valid 6-digit OTP');
    }
  };

  const handleSendForgotOtp = () => {
    setForgotPasswordStep(2);
    setForgotOtpTimer(45);
    setCanResendForgotOtp(false);
  };

  const handleVerifyForgotOtp = () => {
    const otp = forgotOtpValues.join('');
    if (otp.length === 6) {
      setForgotPasswordStep(3);
      setForgotOtpValues(['', '', '', '', '', '']);
    } else {
      alert('Please enter a valid 6-digit OTP');
    }
  };

  const handleSetNewPassword = () => {
    if (passwordStrength >= 3 && passwordMatch) {
      alert('Password reset successfully!');
      setShowForgotPasswordModal(false);
      setForgotPasswordData({ email: '', newPassword: '', confirmPassword: '' });
      setForgotPasswordStep(1);
    } else {
      if (passwordStrength < 3) {
        alert('Please create a stronger password');
      } else if (!passwordMatch) {
        alert('Passwords do not match');
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted:', loginForm);
    // Add your login logic here
    onLogin(); // Call the onLogin prop to switch to dashboard
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center p-4 md:p-6 min-h-screen">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="font-pacifico text-3xl text-primary">logo</h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Admin Login – Ahmedabad Heritage
          </h2>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-10 h-10">
                  <i className="ri-mail-line text-gray-400"></i>
                </div>
                <input
                  type="email"
                  id="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="pl-10 w-full h-10 rounded border-gray-300 border focus:border-primary focus:ring focus:ring-primary/20 outline-none px-3"
                  placeholder="Enter your email ID"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-10 h-10">
                  <i className="ri-lock-line text-gray-400"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="pl-10 pr-10 w-full h-10 rounded border-gray-300 border focus:border-primary focus:ring focus:ring-primary/20 outline-none px-3"
                  placeholder="Enter your password"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer w-10 h-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <i className="ri-eye-line text-gray-400"></i>
                  ) : (
                    <i className="ri-eye-off-line text-gray-400"></i>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={loginForm.remember}
                  onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm font-medium text-primary hover:text-secondary"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-white font-medium py-2.5 px-4 rounded-button transition-colors duration-200 flex items-center justify-center"
            >
              <span>Login</span>
            </button>
          </form>


        </div>

        <div className="text-center mt-4 text-sm text-gray-500">
          © 2025 Ahmedabad Heritage. All rights reserved.
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-4 relative">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-close-line"></i>
              </div>
            </button>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Verify OTP
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the OTP sent to your email/phone
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <div className="flex space-x-2 justify-between">
                  {otpValues.map((value, index) => (
                    <input
                      key={index}
                                             ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="otp-input w-10 h-12 text-center rounded border-gray-300 border focus:border-primary focus:ring focus:ring-primary/20 outline-none"
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Resend OTP in <span>{formatTime(otpTimer)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResendOtp}
                  className={`text-sm font-medium ${canResendOtp ? 'text-primary' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  Resend OTP
                </button>
              </div>
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full bg-primary hover:bg-secondary text-white font-medium py-2.5 px-4 rounded-button transition-colors duration-200 flex items-center justify-center"
              >
                <span>Verify & Login</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-4 relative">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-close-line"></i>
              </div>
            </button>

            {/* Step 1: Enter Email */}
            {forgotPasswordStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Forgot Password
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your Email or Phone number to receive OTP
                </p>
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email or Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-10 h-10">
                      <i className="ri-mail-line text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="forgotEmail"
                      value={forgotPasswordData.email}
                      onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                      className="pl-10 w-full h-10 rounded border-gray-300 border focus:border-primary focus:ring focus:ring-primary/20 outline-none px-3"
                      placeholder="Enter your email or phone"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSendForgotOtp}
                  className="w-full bg-primary hover:bg-secondary text-white font-medium py-2.5 px-4 rounded-button transition-colors duration-200 flex items-center justify-center"
                >
                  <span>Send OTP</span>
                </button>
              </div>
            )}

            {/* Step 2: Verify OTP */}
            {forgotPasswordStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Verify OTP</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter the OTP sent to your email/phone
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <div className="flex space-x-2 justify-between">
                    {forgotOtpValues.map((value, index) => (
                      <input
                        key={index}
                                                 ref={(el) => { forgotOtpRefs.current[index] = el; }}
                        type="text"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleForgotOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleForgotOtpKeyDown(index, e)}
                        onPaste={handleForgotOtpPaste}
                        className="forgot-otp-input w-10 h-12 text-center rounded border-gray-300 border focus:border-primary focus:ring focus:ring-primary/20 outline-none"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Resend OTP in <span>{formatTime(forgotOtpTimer)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendForgotOtp}
                    disabled={!canResendForgotOtp}
                    className={`text-sm font-medium ${canResendForgotOtp ? 'text-primary' : 'text-gray-400 cursor-not-allowed'}`}
                  >
                    Resend OTP
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyForgotOtp}
                  className="w-full bg-primary hover:bg-secondary text-white font-medium py-2.5 px-4 rounded-button transition-colors duration-200 flex items-center justify-center"
                >
                  <span>Verify OTP</span>
                </button>
              </div>
            )}

            {/* Step 3: Set New Password */}
            {forgotPasswordStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Set New Password
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create a new password for your account
                </p>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-10 h-10">
                      <i className="ri-lock-line text-gray-400"></i>
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={forgotPasswordData.newPassword}
                      onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
                      className="pl-10 pr-10 w-full h-10 rounded border-gray-300 border focus:border-primary focus:ring focus:ring-primary/20 outline-none px-3"
                      placeholder="Enter new password"
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer w-10 h-10"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <i className="ri-eye-line text-gray-400"></i>
                      ) : (
                        <i className="ri-eye-off-line text-gray-400"></i>
                      )}
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                      <div
                        className={`strength-meter ${getStrengthColor(passwordStrength)} rounded-full h-1`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password strength: {getStrengthText(passwordStrength)}
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-10 h-10">
                      <i className="ri-lock-line text-gray-400"></i>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={forgotPasswordData.confirmPassword}
                      onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 w-full h-10 rounded border-gray-300 border focus:border-primary focus:ring focus:ring-primary/20 outline-none px-3"
                      placeholder="Confirm new password"
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer w-10 h-10"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <i className="ri-eye-line text-gray-400"></i>
                      ) : (
                        <i className="ri-eye-off-line text-gray-400"></i>
                      )}
                    </div>
                  </div>
                  {passwordMatch !== null && (
                    <p className={`text-xs mt-1 ${passwordMatch ? 'text-green-500' : 'text-red-500'}`}>
                      {passwordMatch ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSetNewPassword}
                  className="w-full bg-primary hover:bg-secondary text-white font-medium py-2.5 px-4 rounded-button transition-colors duration-200 flex items-center justify-center"
                >
                  <span>Set New Password</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
