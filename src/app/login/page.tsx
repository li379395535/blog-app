'use client';

import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { login, signup, isLogin } from './actions';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      if (await isLogin()) {
        redirect('/');
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await login(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (formData: FormData) => {
    setIsSignupLoading(true);
    try {
      await signup(formData);
    } finally {
      setIsSignupLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              formAction={handleLogin}
              type="primary"
              loading={isLoading}
              className="w-full"
              size="large"
            >
              Log in
            </Button>
            <div className="text-center text-sm text-gray-600">
              or
            </div>
            <Button
              formAction={handleSignup}
              loading={isSignupLoading}
              className="w-full"
              size="large"
            >
              Register now!
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}