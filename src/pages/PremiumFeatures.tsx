import { SparklesIcon, ZapIcon, CrownIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from 'lucide-react';

export function PremiumFeatures() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white relative">
      {/* Header with X button and PREMIUM text */}
      <div className="flex items-center justify-between p-6 relative z-50">
        <button 
          onClick={() => navigate('/')} 
          className="text-white hover:text-gray-300 transition cursor-pointer p-2 hover:bg-gray-800 rounded-full"
        >
          <XIcon size={24} />
        </button>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="font-bold text-lg">PREMIUM</span>
        </div>
        <div></div> {/* Empty div for proper spacing */}
      </div>

      {/* Background sparkles effect */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute w-40 h-40 bg-[#8C52FF] rounded-full filter blur-[100px] top-0 left-0 opacity-30"></div>
        <div className="absolute w-40 h-40 bg-[#8C52FF] rounded-full filter blur-[100px] top-20 right-0 opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full pt-1 pl-6 pr-6 pb-6">
        {/* Title and Description Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">StudyPal: AI Homework Helper</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Saves time and stress while ensuring clarity and quality in your homework, making it the smart choice for tackling assignments with ease.
          </p>
        </div>

        {/* Cards - 3 column layout on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:items-end pt-5">
          {/* Card 1 */}
          <div className="bg-[#2a1052]/80 p-4 rounded-2xl border border-purple-500/30 backdrop-blur-sm min-h-[280px] flex flex-col max-w-xs mx-auto md:mx-0 relative">
            <div className="bg-[#8C52FF] w-10 h-10 flex items-center justify-center rounded-xl mb-3">
              <ZapIcon size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3">Free Plan</h3>
            <ul className="space-y-2 text-gray-300 flex-1 text-sm">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>10 Requests / Daily</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>30 Request / Monthly </span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Free for Lifetime</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>No Credit Card Required</span>
              </li>
            </ul>
          </div>

          {/* Card 2 - Elevated */}
          <div className="bg-[#2a1052]/80 p-4 rounded-2xl border border-purple-500/30 backdrop-blur-sm min-h-[280px] flex flex-col max-w-xs mx-auto md:mx-0 relative md:-mt-8 mb-8">
            <div className="bg-[#8C52FF] w-10 h-10 flex items-center justify-center rounded-xl mb-3">
              <SparklesIcon size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3"> Gold Plan </h3>
            <ul className="space-y-2 text-gray-300 flex-1 text-sm">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>50 Requests / Daily</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>1,500 Requests / Monthly </span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Email Support</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Chat Support</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>24/7 availability</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-[#2a1052]/80 p-4 rounded-2xl border border-purple-500/30 backdrop-blur-sm min-h-[280px] flex flex-col max-w-xs mx-auto md:mx-0 relative">
            <div className="bg-[#8C52FF] w-10 h-10 flex items-center justify-center rounded-xl mb-3">
              <CrownIcon size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3">
              Diamond Plan
            </h3>
            <ul className="space-y-2 text-gray-300 flex-1 text-sm">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>150 Requests / Daily</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span> 4,500 Requests / Monthly </span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Email Support</span>
              </li>
              
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Export chat history</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-md mx-auto">
          <button className="w-full p-4 rounded-xl bg-[#8C52FF] text-white font-bold shadow-lg shadow-purple-500/30 hover:bg-[#7a4ae6] transition-colors">
            Get Now
          </button>
          <p className="text-center text-sm text-gray-400 mt-2">
            7-day free trial, then $9.99/month
          </p>
        </div>
      </div>
    </div>
  );
}