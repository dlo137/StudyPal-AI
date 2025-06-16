import { SendIcon, CopyIcon } from 'lucide-react';
export function ChatInterface() {
  return <div className="flex flex-col h-screen bg-[#121212] text-white">
      <div className="flex items-center p-4 border-b border-[#333333]">
        <h1 className="text-xl font-medium flex-1 text-center">Studypal</h1>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
        {/* Bot welcome message */}
        <div className="flex">
          <div className="bg-[#222222] text-white p-4 rounded-xl max-w-[85%]">
            <p>
              Hi there, I am here to assist you with any request using my AI
              brain! Ask me anything you want.
            </p>
          </div>
        </div>
        {/* User message */}
        <div className="flex justify-end">
          <div className="bg-[#4285F4] text-white p-4 rounded-xl max-w-[85%]">
            <p>what are bacteria? in 50 words</p>
          </div>
        </div>
        {/* Bot response */}
        <div className="flex">
          <div className="bg-[#222222] text-white p-4 rounded-xl max-w-[85%] relative">
            <p>
              Bacteria are single-celled microorganisms that belong to the
              domain of prokaryotes. They are among the most ancient life forms
              on Earth and come in various shapes and sizes. Bacteria play
              crucial roles in ecosystems, with some causing diseases while
              others are beneficial, aiding in processes like digestion and
              nitrogen fixation.
            </p>
            <div className="absolute bottom-2 right-2">
              <CopyIcon size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-[#333333] bg-[#121212]">
        <div className="flex items-center bg-[#222222] rounded-full p-2 pl-4">
          <input type="text" placeholder="Type a question" className="flex-1 bg-transparent border-none focus:outline-none text-white" />
          <button className="bg-[#4285F4] p-2 rounded-full">
            <SendIcon size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>;
}