import { useState } from 'react';
import axios from 'axios';

export const useFetchBlogs = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://highscore-tech-server.onrender.com/api/get-all-blogs');
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch blog posts. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, executeFetch };
};
