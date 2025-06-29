import { SparklesIcon, ZapIcon, CrownIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from 'lucide-react';

export function PremiumFeatures() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#121212] text-white relative overflow-x-hidden">
      {/* Header with X button and PREMIUM text */}
      <div className="flex items-center justify-between p-4 sm:p-6 relative z-50">
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

      {/* Title, Descriptions, Cards, Button, etc */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 pb-8 sm:pb-12">
        {/* Title and Description Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">StudyPal: AI Homework Helper</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-2">
            Saves time and stress while ensuring clarity and quality in your homework, making it the smart choice for tackling assignments with ease.
          </p>
        </div>

        {/* Cards - 3 column layout on all screen sizes */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {/* Card 1 */}
          <div className="bg-[#2a1052]/80 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border border-purple-500/30 backdrop-blur-sm h-[200px] sm:h-[240px] md:h-[280px] flex flex-col relative">
            <div className="bg-[#8C52FF] w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl mb-2 md:mb-3">
              <ZapIcon size={12} className="text-white sm:hidden" />
              <ZapIcon size={16} className="text-white hidden sm:block md:hidden" />
              <ZapIcon size={20} className="text-white hidden md:block" />
            </div>
            <h3 className="text-xs sm:text-sm md:text-lg font-bold mb-2 md:mb-3">Free Plan</h3>
            <ul className="space-y-1 sm:space-y-1.5 md:space-y-2 text-gray-300 flex-1 text-xs sm:text-xs md:text-sm">
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>10 Requests/Daily</span>
              </li>
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>30 Requests/Monthly</span>
              </li>
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>Free Forever</span>
              </li>
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>No Credit Card Required </span>
              </li>
            </ul>
          </div>

          {/* Card 2 - Elevated */}
          <div className="bg-[#2a1052]/80 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border border-purple-500/30 backdrop-blur-sm h-[200px] sm:h-[240px] md:h-[280px] flex flex-col relative sm:-mt-4 md:-mt-8">
            <div className="bg-[#8C52FF] w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl mb-2 md:mb-3">
              <SparklesIcon size={12} className="text-white sm:hidden" />
              <SparklesIcon size={16} className="text-white hidden sm:block md:hidden" />
              <SparklesIcon size={20} className="text-white hidden md:block" />
            </div>
            <h3 className="text-xs sm:text-sm md:text-lg font-bold mb-2 md:mb-3">Gold Plan</h3>
            <ul className="space-y-1 sm:space-y-1.5 md:space-y-2 text-gray-300 flex-1 text-xs sm:text-xs md:text-sm">
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>50 Requests/Daily</span>
              </li>
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>1.5K Requests/Monthly</span>
              </li>
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>Email Support</span>
              </li>
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>Chat Support</span>
              </li>
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>24/7 Available</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-[#2a1052]/80 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border border-purple-500/30 backdrop-blur-sm h-[200px] sm:h-[240px] md:h-[280px] flex flex-col relative">
            <div className="bg-[#8C52FF] w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl mb-2 md:mb-3">
              <CrownIcon size={12} className="text-white sm:hidden" />
              <CrownIcon size={16} className="text-white hidden sm:block md:hidden" />
              <CrownIcon size={20} className="text-white hidden md:block" />
            </div>
            <h3 className="text-xs sm:text-sm md:text-lg font-bold mb-2 md:mb-3">
              Diamond Plan
            </h3>
            <ul className="space-y-1 sm:space-y-1.5 md:space-y-2 text-gray-300 flex-1 text-xs sm:text-xs md:text-sm">
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>150 Requests/Daily</span>
              </li>
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>4.5K Requests/Monthly</span>
              </li>
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>Email Support</span>
              </li>
              <li className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#8C52FF] flex-shrink-0"></div>
                <span>Export History</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-md mx-auto">
          <button className="w-full p-3 sm:p-4 rounded-xl bg-[#8C52FF] text-white font-bold shadow-lg shadow-purple-500/30 hover:bg-[#7a4ae6] transition-colors text-sm sm:text-base cursor-pointer">
            Get Now
          </button>
          <p className="text-center text-xs sm:text-sm text-gray-400 mt-2">
            7-day free trial, then $9.99/month
          </p>
          
        </div>
      </div>
    </div>
  );
}