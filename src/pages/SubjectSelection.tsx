import React from 'react';
import { Link } from 'react-router-dom';
export function SubjectSelection() {
  const subjects = [{
    id: 'all',
    name: 'All subjects',
    icon: '📚'
  }, {
    id: 'math',
    name: 'Mathematics',
    icon: '➗'
  }, {
    id: 'biology',
    name: 'Biology',
    icon: '🧬'
  }, {
    id: 'history',
    name: 'History',
    icon: '🏛️'
  }, {
    id: 'physics',
    name: 'Physics',
    icon: '⚛️'
  }, {
    id: 'chemistry',
    name: 'Chemistry',
    icon: '🧪'
  }, {
    id: 'geography',
    name: 'Geography',
    icon: '🏔️'
  }];
  return <div className="flex flex-col min-h-screen bg-[#121212] text-white p-6">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 rounded-full bg-[#8C52FF] flex items-center justify-center mr-4">
          <span className="text-xl">😊</span>
        </div>
        <div className="bg-[#222222] p-4 rounded-xl flex-1">
          <p className="text-white">Which subjects you would like to learn?</p>
        </div>
      </div>
      <div className="space-y-3 mb-8">
        {subjects.map(subject => <div key={subject.id} className={`p-4 rounded-xl flex items-center ${subject.id === 'math' ? 'bg-[#8C52FF] ring-4 ring-[#8C52FF]/30' : 'bg-[#222222]'}`}>
            <span className="text-2xl mr-4">{subject.icon}</span>
            <span className="text-lg">{subject.name}</span>
          </div>)}
      </div>
      <Link to="/chat" className="mt-auto">
        <button className="w-full p-4 rounded-lg bg-[#8C52FF] text-white font-bold">
          Continue
        </button>
      </Link>
    </div>;
}