import { XIcon, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
export function ScanHomework() {
  return <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Link to="/chat">
          <XIcon size={24} className="text-white" />
        </Link>
        <div className="w-6 h-6" />
      </div>
      {/* Camera Frame */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Frame Guidelines */}
        <div className="w-full aspect-[3/4] relative">
          <div className="absolute inset-0 border-2 border-white/30 rounded-lg"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg"></div>
        </div>
        {/* Instructions */}
        <div className="absolute top-8 left-0 right-0 text-center">
          <p className="text-sm text-white/90 bg-black/50 py-2">
            Center the question on your screen
          </p>
        </div>
      </div>
      {/* Bottom Controls */}
      <div className="p-8 pb-24 flex justify-center items-center space-x-8">
        <button className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center">
          <ImageIcon size={20} className="text-white" />
        </button>
        <button className="w-20 h-20 rounded-full bg-[#8C52FF] border-4 border-white flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-white"></div>
        </button>
        <div className="w-12 h-12"></div> {/* Placeholder for symmetry */}
      </div>
    </div>;
}