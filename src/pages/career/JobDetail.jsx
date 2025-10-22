import React from 'react';
import { useParams } from 'react-router-dom';
import { jobsData } from '../../data/jobsData';

const JobDetail = () => {
  const { jobId } = useParams();
  const job = jobsData.find((job) => job.id === parseInt(jobId));

  if (!job) {
    return <div className="text-center py-10">Job not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-white">{job.title}</h1>
        <p className="text-lg text-gray-400 mb-2">{job.company} - {job.location}</p>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Job Description</h2>
          <p className="text-gray-300 leading-relaxed">{job.description}</p>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Requirements</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Benefits</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {job.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;