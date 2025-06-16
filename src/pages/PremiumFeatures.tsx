import React from 'react';
import { SparklesIcon, ZapIcon, StarIcon, CrownIcon } from 'lucide-react';
export function PremiumFeatures() {
  return <div className="flex flex-col min-h-screen bg-[#1a0b2e] text-white">
      {/* Background sparkles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-40 h-40 bg-[#8C52FF] rounded-full filter blur-[100px] top-0 left-0 opacity-30"></div>
        <div className="absolute w-40 h-40 bg-[#8C52FF] rounded-full filter blur-[100px] top-20 right-0 opacity-30"></div>
      </div>
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-medium text-center flex-1">
            What you can get?
          </h1>
        </div>
        {/* Content */}
        <div className="flex flex-col items-center p-6 space-y-4">
          {/* Card 1 */}
          <div className="w-full bg-[#2a1052]/80 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <div className="bg-[#8C52FF] inline-block p-3 rounded-xl mb-4">
              <ZapIcon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">Activate Super AI</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Unlimited question credits</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>5 opportunities to use premium features</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Faster response time</span>
              </li>
            </ul>
          </div>
          {/* Card 2 */}
          <div className="w-full bg-[#2a1052]/80 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <div className="bg-[#8C52FF] inline-block p-3 rounded-xl mb-4">
              <SparklesIcon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">Unlimited + Chat with AI</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Unlimited AI Chat Access</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>No daily chat limits</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Advanced problem solving</span>
              </li>
            </ul>
          </div>
          {/* Card 3 */}
          <div className="w-full bg-[#2a1052]/80 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <div className="bg-[#8C52FF] inline-block p-3 rounded-xl mb-4">
              <CrownIcon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">
              Unlock Exclusive Features
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Access to all premium features</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Priority support</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#8C52FF]"></div>
                <span>Early access to new features</span>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom CTA */}
        <div className="p-4 mt-4">
          <button className="w-full p-4 rounded-xl bg-[#8C52FF] text-white font-bold shadow-lg shadow-purple-500/30">
            Get Now
          </button>
          <p className="text-center text-sm text-gray-400 mt-2">
            7-day free trial, then $9.99/month
          </p>
        </div>
      </div>
    </div>;
}