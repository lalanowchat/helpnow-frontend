import { Card, CardTitle } from '@/components/ui/card';
import logo from '../assets/HelpNow-logo.svg'
import botLogo from '../assets/bot_logo.png'
import { Button } from '@headlessui/react';
import donateHeart from '../assets/donate-heart.svg'
import { TbUrgent } from "react-icons/tb";
import { IoHelpBuoy } from "react-icons/io5";
import { MdOutlineLocalTaxi } from "react-icons/md";
import { IoIosFlag } from "react-icons/io";
import { FaHouseDamage } from "react-icons/fa";
import { GiHealthIncrease } from "react-icons/gi";
import { Link } from 'react-router-dom';



export default function MainPage() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center justify-center bg-blue-400 text-white py-8 px-2 w-full">
        <img src={logo} alt="Help Now Logo" className="h-40 w-40 py-4" />
        <div className="font-bold text-3xl pb-2"> Real-Time Emergency Resources</div>
        <div className="font-light text-xs py-1"> Verified assistance for wildfires, floods, and disasters in Los Angeles</div>
        <div className="font-light text-xs py-1"> Get 24/7 help from Lala, our AI-powered assistant</div>
      </div>
      <div className="flex items-center justify-center p-4 space-x-4 bg-gray-100">
        <Card className="min-h-36 max-h-48 w-60 p-4">
          <div className="flex items-center justify-center">
            <div className="flex font-bold ml-2"> <TbUrgent className="w-10 h-10 sm:w-7 sm:h-7 rounded p-1 text-blue-600 mr-2 bg-blue-200" /> I Need Help</div>
          </div>
          <div className="text-[0.600rem] py-2"> Find food, shelter, healthcare, and emergency services near you</div>
          <Link
            to="/need-help"
          >
            <Button className="text-white bg-blue-500 w-full h-8 rounded-md text-[.600rem] mb-4 mt-2"> Find Resources Now </Button>
          </Link>
        </Card>
        <Card className="min-h-36 max-h-48 w-60 p-4">
          <div className="flex items-center justify-center">
            <div className="flex font-bold ml-2">  <IoHelpBuoy className="w-10 h-10 sm:w-7 sm:h-7 rounded p-1 text-green-600 mr-2 bg-green-200" /> I Want Help</div>
          </div>
          <div className="text-[0.600rem] py-2"> Volunteer, donate, or register your organization</div>
          <Link to="https://mutualaidla.org/get-involved/">
            <Button className="text-white bg-green-600 w-full h-8 rounded-md text-[.600rem] mb-4 mt-2"> Get Involved </Button>
          </Link>
        </Card>
      </div>
      <div className="flex flex-col items-center justify-center py-8">
        <img src={botLogo} alt="Lala Logo" className="h-12 w-12 mb-2" />
        <div className="text-lg font-extrabold">Meet Lala, Your AI Assistant</div>
        <div className="text-[0.600rem] py-2 max-w-96"> Available 24/7 in multiple languages to help you find resources, answer questions, and contact you with the right services</div>
        <div className="bg-gray-200 flex justify-center items-center w-80 h-40">
          Box
        </div>
        <Button className="text-white bg-slate-800 h-8 rounded-md text-[.600rem] mb-8 mt-4 w-40"> Start Chatting with Lala </Button>
      </div>
      <div className="bg-gray-100 grid grid-cols-2 py-10 px-6">
        <div className="flex flex-col items-center justify-center">
          <div className="font-extrabold pb-2 text-md sm:text-lg">Serving Los Angeles County </div>
          <div className="grid grid-cols-2 w-full">
            <div className="pb-2">
              <div className="text-lg text-blue-500 font-bold -mb-1">300+</div>
              <div className="text-[0.500rem] sm:text-sm text-gray-600">Organizations</div>
            </div>
            <div>
              <div className="text-lg text-green-500 font-bold -mb-1">1000+</div>
              <div className="text-[0.500rem] sm:text-sm text-gray-600">Resources</div>
            </div>
            <div>
              <div className="text-lg text-slate-600 font-bold -mb-1">15</div>
              <div className="text-[0.500rem] sm:text-sm text-gray-600"> Languages</div>
            </div>
            <div>
              <div className="text-lg text-orange-400 font-bold -mb-1">24/7</div>
              <div className="text-[0.500rem] sm:text-sm text-gray-600">Availability</div>
            </div>
            <div className="text-xs pt-4 pb-4  col-span-2">From Malibu to Long Beach, we connect communities with verified emergency resources across all of Los Anageles County. Our Network grows daily with new organizations and services </div>
          </div>
        </div>
        <div className="px-8">
          <div className="bg-white flex items-center justify-center h-full w-full">Box</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="font-extrabold text-2xl py-10">Emergency Resource Categories</div>
        <div className="flex flex-wrap mb-10 items-center justify-center">
          <div className="bg-gray-100 flex flex-col items-center justify-center p-4 max-w-40 rounded-md xs:m-4 m-1">
            <IoIosFlag className="bg-orange-200 text-orange-400 p-1 w-7 h-7 mb-2 rounded" />
            <div className="font-extrabold text-xs">Find Assistance</div>
            <div className="text-[0.600rem] font-light">Food banks, pantries, some programs</div>
          </div>
          <div className="bg-gray-100 flex flex-col items-center justify-center p-4 max-w-40 rounded-md xs:m-4 m-1">
            <FaHouseDamage className="bg-purple-200 text-purple-400 p-1 w-7 h-7 mb-2 rounded" />
            <div className="font-extrabold text-xs">Housing</div>
            <div className="text-[0.600rem] font-light">Shelters, temporary housing, centers </div>
          </div>
          <div className="bg-gray-100 flex flex-col items-center justify-center p-4 max-w-40 rounded-md xs:m-4 m-1">
            <div>            <MdOutlineLocalTaxi className="bg-red-200 text-red-400 p-1 w-7 h-7 mb-2 rounded" /></div>
            <div className="font-extrabold text-xs">HealthCare</div>
            <div className="text-[0.600rem] font-light">Medical kits, clinics, mental health</div>
          </div>
          <div className="bg-gray-100 flex flex-col items-center justify-center p-4 max-w-40 rounded-md xs:m-4 m-1">
            <div>            <GiHealthIncrease className="bg-yellow-100 text-yellow-400 p-1 w-7 h-7 mb-2 rounded" /></div>
            <div className="font-extrabold text-xs">Emergency Services</div>
            <div className="text-[0.600rem] font-light">Crisis response, disaster relief</div>
          </div>
        </div>
      </div>
      <div className="bg-teal-600 flex flex-col py-8 px-16">
        <div className="text-white font-extrabold pb-4">
          Making a Difference Together
        </div>
        <div className="text-white grid grid-cols-3">
          <div className="flex flex-col items-center justify-center">
            <div className="font-extrabold">50K+</div>
            <div className="font-light text-xs">People Helped</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="font-extrabold">150K+</div>
            <div className="font-light text-xs">Resources Shared</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="font-extrabold">24/7+</div>
            <div className="font-light text-xs">Always Available</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-blue-300 bg-opacity-20 m-6 rounded-lg text-white">
          <img src={donateHeart} alt="Yellow Heart" className="h-20 w-20 py-4" />
          <div className="font-bold text-lg">Support Our Mission</div>
          <div className="text-xs mx-8 py-4 font-extralight">
            Help us maintain and expand our emergency resource network. Every donation directly supports families in crisis.
          </div>
          <Button className="bg-red-500 rounded-md text-[0.650rem] h-8 w-32 mb-4"> Donate Now </Button>
        </div>
      </div>

    </div>
  );
}
