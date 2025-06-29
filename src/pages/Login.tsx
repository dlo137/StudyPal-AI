import { Link, useNavigate } from 'react-router-dom';
import { XIcon } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Header - stays at top */}
      <div className="flex justify-between items-center p-6">
        <button 
          onClick={() => navigate('/')} 
          className="text-white hover:text-gray-300 transition cursor-pointer"
        >
          <XIcon size={24} />
        </button>
        <span className="font-bold">LOG IN</span>
        <div></div> {/* Empty div for spacing */}
      </div>

      {/* Main content - centered in remaining space */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Join StudyBuddy AI</h1>
            <p className="text-gray-300">
              Get instant answers, scan your homework to solve it, and ace your
              exams with
              <span className="font-semibold"> AI-powered features</span> tailored
              to your learning style!
            </p>
          </div>

          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-4 rounded-lg bg-[#2A2A2A] text-white border-none" 
            />
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

          <p className="text-xs text-gray-400 text-center">
            To make StudyBuddy work, we log user data and share it with service
            providers. Click "Sign up" above to accept StudyBuddy
            <span className="text-[#8C52FF]"> Terms of service</span> &
            <span className="text-[#8C52FF]"> Privacy Policy</span>.
          </p>
        </div>
      </div>

      {/* Footer link - stays at bottom */}
      <div className="p-6">
        <Link to="/" className="block text-center text-sm text-[#8C52FF]">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  );
}