/**
 * Signup Page
 * Allows new users to create an account
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, XCircle } from 'lucide-react';

// Password requirement indicator component
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center text-xs">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-300 mr-2" />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-500'}>{text}</span>
    </div>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  // Real-time password validation checks
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSymbol) {
      setError('Password must contain uppercase, lowercase, number, and symbol');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error signing up:", err);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
      <Head>
        <title>Account Creation</title>
        <meta name="description" content="Your account has been created successfully." />
      </Head>

      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="rounded-md bg-green-50 p-4">
            <h3 className="text-sm font-medium text-green-800">
              Account created successfully!
            </h3>
            <p className="mt-2 text-sm text-green-700">
              Please check your email to verify your account. You will be redirected to the login page...
            </p>
          </div>
        </div>
      </main>
      </>
    );
  }

  return (
    <>
    <Head>
      <title>Create Account</title>
      <meta name="description" content="Create your account." />
    </Head>

    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            EdVisingU Application Portal
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div id="submit-error" className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="At least 8 characters with uppercase, lowercase, number, symbol"
              />
              
              {/* Password Requirements Checklist */}
              {password && (
                <div className="mt-2 space-y-1">
                  <PasswordRequirement 
                    met={passwordChecks.minLength} 
                    text="At least 8 characters" 
                  />
                  <PasswordRequirement 
                    met={passwordChecks.hasUpperCase} 
                    text="Contains uppercase letter (A-Z)" 
                  />
                  <PasswordRequirement 
                    met={passwordChecks.hasLowerCase} 
                    text="Contains lowercase letter (a-z)" 
                  />
                  <PasswordRequirement 
                    met={passwordChecks.hasNumber} 
                    text="Contains number (0-9)" 
                  />
                  <PasswordRequirement 
                    met={passwordChecks.hasSymbol} 
                    text="Contains symbol (!@#$%^&*...)" 
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
    </>
  );
}
