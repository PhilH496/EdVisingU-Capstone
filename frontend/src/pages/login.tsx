/**
 * Login Page
 * Allows users to sign in to their account
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Handle email not confirmed error
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before logging in. Check your inbox for the verification link.');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      // Login successful - fetch user profile to determine role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // Redirect based on role
        if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          // For students, check if they already submitted an application
          const { data: studentData } = await supabase
            .from('student')
            .select('student_id')
            .eq('email', user.email)
            .single();

          if (studentData) {
            // Check if student has any submitted applications
            const { data: existingApp } = await supabase
              .from('applications')
              .select('id')
              .eq('student_id', studentData.student_id.toString())
              .limit(1)
              .single();

            if (existingApp) {
              // Student has already submitted, go to dashboard
              router.push('/student-dashboard');
            } else {
              // No submission yet, go to application form
              router.push('/application');
            }
          } else {
            // New student, go to application form
            router.push('/application');
          }
        }
      } else {
        router.push('/application');
      }
      
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error logging in:", err);
      setLoading(false);
    }
  };

  return (
    <>
    <Head>
      <title>Sign In</title>
      <meta name="description" content="Sign in to your EdvisingU account to access the BSWD application portal." />
    </Head>
    
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            EdVisingU Application Portal
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div id="login-error" className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
          <Link 
            href="/" 
            className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            Back to Home
          </Link>
        </form>
      </div>
    </main>
    </>
  );
}
