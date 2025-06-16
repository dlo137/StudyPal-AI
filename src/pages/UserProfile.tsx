import { SettingsIcon, CrownIcon, BookmarkIcon, ClockIcon, MessageSquareIcon } from 'lucide-react';
export function UserProfile() {
  return <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <div className="flex items-center justify-between p-4 border-b border-[#333333]">
        <h1 className="text-xl font-medium flex-1 text-center">Profile</h1>
        <SettingsIcon size={20} />
      </div>
      <div className="flex flex-col items-center p-6 border-b border-[#333333]">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#8C52FF] to-[#5CE1E6] flex items-center justify-center mb-4">
          <span className="text-4xl">👨‍🎓</span>
        </div>
        <h2 className="text-xl font-bold">Alex Johnson</h2>
        <p className="text-gray-400">alex.johnson@example.com</p>
        <div className="mt-4 flex items-center bg-[#222222] px-4 py-2 rounded-full">
          <CrownIcon size={16} className="text-yellow-500 mr-2" />
          <span className="text-sm font-medium">Premium Member</span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-2">Activity</h3>
        <div className="bg-[#222222] p-4 rounded-lg flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center mr-4">
            <BookmarkIcon size={20} className="text-[#8C52FF]" />
          </div>
          <div>
            <h4 className="font-medium">Saved Responses</h4>
            <p className="text-sm text-gray-400">
              Access your bookmarked answers
            </p>
          </div>
        </div>
        <div className="bg-[#222222] p-4 rounded-lg flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center mr-4">
            <ClockIcon size={20} className="text-[#8C52FF]" />
          </div>
          <div>
            <h4 className="font-medium">History</h4>
            <p className="text-sm text-gray-400">
              View your past conversations
            </p>
          </div>
        </div>
        <div className="bg-[#222222] p-4 rounded-lg flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center mr-4">
            <MessageSquareIcon size={20} className="text-[#8C52FF]" />
          </div>
          <div>
            <h4 className="font-medium">Study Sessions</h4>
            <p className="text-sm text-gray-400">
              Track your learning progress
            </p>
          </div>
        </div>
      </div>
      <div className="mt-auto p-4">
        <button className="w-full p-3 rounded-lg border border-[#444444] text-gray-300">
          Sign Out
        </button>
      </div>
    </div>;
}