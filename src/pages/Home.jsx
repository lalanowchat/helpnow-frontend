import React from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/HelpNow-logo.svg'
import heart from '../assets/donate-heart.svg'

export default function Home() {
  const { t } = useTranslation();
  return (
    <>
      <Header title="HelpNow Inc" />
      <div className="flex flex-col items-center justify-center p-4">
        {/* Main container */}
        <img src={logo} alt="Help Now Logo" className="h-80 w-80 py-4" />
        <div className="flex flex-col md:flex-row w-full max-w-4xl gap-4">
          {/* Need Help Button */}
          <Link
            to="/need-help"
            className="flex-1 p-4 text-lg md:text-xl bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
          >
            {t('header.needHelp')}
          </Link>
          {/* Want to Help Button */}
          <Link
            to="https://pinevalleysedona.com/frequently-used-phone-numbers-and-emergency-websites/"
            className="flex-1 p-4 text-lg md:text-xl bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
          >
            {t('header.wantToHelp')}
          </Link>
        </div>
        <div className="pt-8">
          HelpNow provides real-time, verified emergency resources for wildfires, floods, and disasters. Get 24/7 assistance from Lala, our AI-powered digital assistant.
        </div>
        <Link
          to="https://www.zeffy.com/fundraising/donate-to-provide-los-angeles-with-real-time-verified-resources-in-times-of-crisis"
          className="hover:animate-pulse"
        >
          <img src={heart} alt="Donate Heart" className="h-60 w-60 py-4" />
          <div className="-translate-y-40 text-2xl font-bold text-[#2f4860]">Donate Now</div>
        </Link>
      </div>
    </>
  );
}
