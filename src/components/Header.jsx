import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Header({ title }) {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="top-0 left-0 right-0 z-20 border-b bg-background/95 backdrop-blur-lg shadow-md">
      <nav className="flex items-center justify-between h-16 px-6 md:px-16">
        <div className="text-2xl font-semibold text-black tracking-tight">
          {title}
        </div>

        <div className="relative">
          <select
            onChange={handleLanguageChange}
            className="p-3 rounded-md bg-blue-500 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-600 transition duration-200 ease-in-out"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="ko">한국어</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ru">Русский</option>
            <option value="vi">Tiếng Việt</option> 
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
            <option value="hi">हिंदी</option>
            <option value="it">Italiano</option>
            <option value="de">Deutsch</option>
            <option value="nl">Nederlands</option>
            <option value="tl">Tagalog</option>
            <option value="hy">Հայերեն</option>
            <option value="fa">فارسی</option> 
          </select>
        </div>
      </nav>
    </div>
  );
}
