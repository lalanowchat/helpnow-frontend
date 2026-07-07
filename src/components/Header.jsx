import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LifeBuoy, HeartHandshake, Heart, MessageCircle, Menu } from 'lucide-react';
import NavButton from './NavButton';
import logo from '../assets/HelpNow-logo.svg';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

function MobileMenu({ navItems, open, onOpenChange }) {
  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 pt-8 px-3 flex flex-col gap-1">
          {navItems}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function Header({ onNeedHelp, onWantToHelp, onLogoClick, activeDropdown, logoHref = '/' }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);


  const openChat = () => {
    if (window.voiceflow?.chat) {
      window.voiceflow.chat.open();
    }
  };

  const handleLogoClick = () => {
    navigate(logoHref);
    onLogoClick?.();
    setDrawerOpen(false);
  };

  // Wrap nav actions so the drawer closes on mobile after selection
  const handle = (fn) => () => {
    fn?.();
    setDrawerOpen(false);
  };

  const mobileNavItems = (
    <>
      <NavButton
        inline
        label="Need Help"
        icon={<LifeBuoy className="w-5 h-5 text-red-600" />}
        onClick={handle(onNeedHelp ?? (() => navigate('/need-help')))}
        className={activeDropdown === 'needHelp' || activeDropdown === null ? 'text-black bg-gray-100' : 'text-black hover:bg-gray-100 focus-visible:ring-gray-400'}
      />
      {/* <NavButton
        inline
        label="Want to Help"
        icon={<Heart className="w-5 h-5 text-emerald-600" />}
        onClick={handle(onWantToHelp ?? (() => navigate('/want-to-help')))}
        className={activeDropdown === 'wantToHelp' ? 'text-black bg-gray-100' : 'text-black hover:bg-gray-100 focus-visible:ring-gray-400'}
      /> */}
      <NavButton
        inline
        label="Chat with Lala"
        icon={<MessageCircle className="w-5 h-5 text-blue-600" />}
        onClick={handle(openChat)}
        className="text-black hover:bg-gray-100 focus-visible:ring-gray-400"
      />
      <NavButton
        inline
        label="Donate"
        icon={<HeartHandshake className="w-5 h-5 text-violet-500" />}
        href="https://www.zeffy.com/fundraising/donate-to-provide-los-angeles-with-real-time-verified-resources-in-times-of-crisis"
        className="text-black hover:bg-gray-100 focus-visible:ring-gray-400"
      />
    </>
  );

  return (
    <div className="top-0 left-0 right-0 z-20 border-b bg-background/95 backdrop-blur-lg shadow-md">
      <nav className="flex items-center justify-between h-16 pl-6 pr-4">
        {/* Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-2 text-sm sm:text-2xl font-bold text-black tracking-tight hover:opacity-70 transition-opacity duration-200"
        >
          <div>HelpNow Inc</div>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center">
          <NavButton
            label="Need Help"
            icon={<LifeBuoy className="w-5 h-5 text-red-600" />}
            onClick={(() => navigate('/need-help'))}
            className={activeDropdown === 'needHelp' || activeDropdown === null || pathname === '/need-help' ? 'text-black bg-gray-100' : 'text-black hover:bg-gray-100 focus-visible:ring-gray-400'}
          />
          {/* <NavButton
            label="Want to Help"
            icon={<Heart className="w-5 h-5 text-emerald-600" />}
            onClick={onWantToHelp ?? (() => navigate('/want-to-help'))}
            className={activeDropdown === 'wantToHelp' ? 'text-black bg-gray-100' : 'text-black hover:bg-gray-100 focus-visible:ring-gray-400'}
          /> */}
          <NavButton
            label="Chat"
            icon={<MessageCircle className="w-5 h-5 text-blue-600" />}
            onClick={openChat}
            className="text-black hover:bg-gray-100 focus-visible:ring-gray-400"
          />
          <NavButton
            label="Donate"
            icon={<HeartHandshake className="w-5 h-5 text-violet-500" />}
            href="https://www.zeffy.com/fundraising/donate-to-provide-los-angeles-with-real-time-verified-resources-in-times-of-crisis"
            className="text-black hover:bg-gray-100 focus-visible:ring-gray-400"
          />
        </div>

        {/* Mobile hamburger */}
        <MobileMenu
          navItems={mobileNavItems}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </nav>
    </div>
  );
}
