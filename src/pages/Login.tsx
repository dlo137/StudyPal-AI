import React from 'react';
import { Link } from 'react-router-dom';
import { XIcon } from 'lucide-react';
export function Login() {
  return <div className="flex flex-col min-h-screen bg-[#121212] text-white p-6">
      <div className="flex justify-between items-center mb-10">
        <XIcon size={24} />
        <span className="font-bold">LOG IN</span>
      </div>
      <div className="flex flex-col items-center flex-1 justify-center space-y-6">
        <h1 className="text-2xl font-bold mb-2">Join StudyBuddy AI</h1>
        <p className="text-center text-gray-300 mb-6">
          Get instant answers, scan your homework to solve it, and ace your
          exams with
          <span className="font-semibold"> AI-powered features</span> tailored
          to your learning style!
        </p>
        <div className="w-full space-y-4">
          <input type="email" placeholder="Email" className="w-full p-4 rounded-lg bg-[#2A2A2A] text-white border-none" />
          <button className="w-full p-4 rounded-lg bg-[#8C52FF] text-white font-bold">
            SIGN UP
          </button>
          <p className="text-center text-sm text-gray-400">
            We won't spam you. We value your privacy.
          </p>
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-[#333333]"></div>
            <div className="px-4 text-gray-400">OR</div>
            <div className="flex-1 h-px bg-[#333333]"></div>
          </div>
          <button className="w-full p-4 rounded-lg bg-white text-black font-bold flex items-center justify-center">
            <span className="mr-2">🍎</span>
            CONTINUE WITH APPLE
          </button>
          <button className="w-full p-4 rounded-lg bg-[#222222] text-white font-bold flex items-center justify-center border border-[#444444]">
            <span className="mr-2">G</span>
            CONTINUE WITH GOOGLE
          </button>
          <button className="w-full p-4 rounded-lg bg-[#1877F2] text-white font-bold flex items-center justify-center">
            <span className="mr-2">f</span>
            CONTINUE WITH FACEBOOK
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-8">
          To make StudyBuddy work, we log user data and share it with service
          providers. Click "Sign up" above to accept StudyBuddy
          <span className="text-[#8C52FF]"> Terms of service</span> &
          <span className="text-[#8C52FF]"> Privacy Policy</span>.
        </p>
      </div>
      <Link to="/" className="text-center text-sm text-[#8C52FF] mt-4">
        Already have an account? Log in
      </Link>
    </div>;
}