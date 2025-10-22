import React from 'react';
import { Link } from 'react-router-dom';
import { jobsData } from '../../data/jobsData';

const Careers = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Join Our Team
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            We are looking for passionate and talented individuals to help us build the future. Explore our open positions and find your next career opportunity.
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {jobsData.map((job) => (
              <Link
                to={`/careers/${job.id}`}
                key={job.id}
                className="block p-8 bg-gray-800 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:-translate-y-2 border border-transparent hover:border-cyan-500"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex-grow mb-4 sm:mb-0">
                    <h2 className="text-3xl font-bold text-cyan-400 mb-2">
                      {job.title}
                    </h2>
                    <p className="text-gray-400 text-lg">
                      {job.company} - {job.location}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="bg-cyan-500 text-gray-900 font-semibold py-2 px-4 rounded-full transition-colors duration-300 hover:bg-cyan-400">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Careers;