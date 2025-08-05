import React from 'react';
import { CalendarToday, AccessTime, LocationOn } from '@mui/icons-material';
import 'animate.css';

// Function to get next Thursday's date
const getNextThursday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7; // 4 = Thursday
  const nextThursday = new Date(today);
  
  if (daysUntilThursday === 0 && today.getHours() >= 18) {
    // If it's Thursday and past 6 PM, get next Thursday
    nextThursday.setDate(today.getDate() + 7);
  } else {
    nextThursday.setDate(today.getDate() + daysUntilThursday);
  }
  
  return nextThursday.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const eventsData = [
  {
    image: "/assets/10363611.jpg",
    title: "Midweek Koinonia",
    date: getNextThursday(),
    time: "6:00 PM",
    venue: "Logic Church Port Harcourt Center"
  },
  {
    image: "/assets/Yes-Indeed-Screen.JPEG.jpg",
    title: "Sunday Worship Service",
    date: "Every Sunday",
    time: "9:00 AM",
    venue: "Logic Church Port Harcourt Center"
  },
//   {
//     image: "/assets/DSC_4518.jpg",
//     title: "Youth Connect",
//     date: "Every Saturday",
//     time: "4:00 PM",
//     venue: "Logic Church Port Harcourt Center"
//   }
];

export default function EventsHome() {
  return (
    <section className="py-20 px-6 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 animate__animated animate__fadeInUp text-white">
            Upcoming{' '}
            <span className="bg-gradient-red bg-clip-text text-transparent">
              Events
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate__animated animate__fadeInUp animate__delay-1s">
            Join us for these upcoming gatherings and activities
          </p>
        </div>

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventsData.map((event, index) => (
            <div
              key={index}
              className="group bg-gray-800/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all duration-500 hover:shadow-2xl hover:shadow-white/10 animate__animated animate__fadeInUp"
              style={{
                animationDelay: `${index * 0.2}s`
              }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden h-64">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-6 group-hover:bg-gradient-red group-hover:bg-clip-text transition-all duration-300">
                  {event.title}
                </h3>

                {/* Event Details */}
                <div className="space-y-4">
                  {/* Date */}
                  <div className="flex items-center gap-3 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <CalendarToday className="text-red-400 text-lg" />
                    </div>
                    <span className="text-sm font-medium">{event.date}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-3 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <AccessTime className="text-blue-400 text-lg" />
                    </div>
                    <span className="text-sm font-medium">{event.time}</span>
                  </div>

                  {/* Venue */}
                  <div className="flex items-center gap-3 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <LocationOn className="text-green-400 text-lg" />
                    </div>
                    <span className="text-sm font-medium">{event.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explore More Button */}
        <div className="text-center mt-16">
          <a
            href="/events"
            className="inline-flex items-center px-8 py-4 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 animate__animated animate__fadeInUp animate__delay-2s"
          >
            Explore More
          </a>
        </div>
      </div>
    </section>
  );
}
