import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, HeartHandshake, Heart, MessageCircle } from 'lucide-react';
import NavButton from './NavButton';
import logo from '../assets/HelpNow-logo.svg'

export default function Header({ title, onNeedHelp, onWantToHelp, onLogoClick, activeDropdown }) {
  const navigate = useNavigate();

  const openChat = () => {
    if (window.voiceflow?.chat) {
      window.voiceflow.chat.open();
    }
  };

  return (
    <div className="top-0 left-0 right-0 z-20 border-b bg-background/95 backdrop-blur-lg shadow-md">
      <nav className="flex items-center justify-between h-16 pl-6">
        <button
          type="button"
          onClick={() => { navigate('/'); onLogoClick?.(); }}
          className="flex items-center gap-2 text-2xl font-semibold text-black tracking-tight hover:opacity-70 transition-opacity duration-200"
        >
          <img src={logo} alt="Help Now Logo" className="h-12 w-12" />
          <div>HelpNow Inc</div>
        </button>

        <div className="flex items-center">
          <NavButton
            label="Need Help"
            icon={<LifeBuoy className="w-5 h-5 text-blue-600" />}
            onClick={onNeedHelp}
            className={activeDropdown === 'needHelp' ? 'text-black bg-gray-100' : 'text-black hover:bg-gray-100 focus-visible:ring-gray-400'}
          />
          <NavButton
            label="Want to Help"
            icon={<Heart className="w-5 h-5 text-emerald-600" />}
            onClick={onWantToHelp}
            className={activeDropdown === 'wantToHelp' ? 'text-black bg-gray-100' : 'text-black hover:bg-gray-100 focus-visible:ring-gray-400'}
          />
          <NavButton
            label="Chat with Lala"
            icon={<MessageCircle className="w-5 h-5 text-violet-600" />}
            onClick={openChat}
            className="text-black hover:bg-gray-100 focus-visible:ring-gray-400"
          />
          <NavButton
            label="Donate"
            icon={<HeartHandshake className="w-5 h-5 text-red-500" />}
            href="https://www.zeffy.com/fundraising/donate-to-provide-los-angeles-with-real-time-verified-resources-in-times-of-crisis"
            className="text-black hover:bg-gray-100 focus-visible:ring-gray-400"
          />
        </div>
      </nav>
    </div>
  );
}
