import React from 'react';
import { useFetchBlogs } from '../hooks/useFetchBlogs';
import LoadingSpinner from './LoadingSpinner';

const BlogPostsSolution = () => {
  const { data, loading, error, executeFetch } = useFetchBlogs();

  return (
    <div>
      <button 
        onClick={executeFetch} 
        disabled={loading}
        style={{
            background: 'var(--gradient-primary)',
            color: 'var(--text-primary)',
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            borderRadius: 'var(--border-radius)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
        }}
      >
        Fetch Blogs
      </button>
      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--accent-pink)' }}>{error}</p>}
      {data && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
          {data.map(blog => (
            <div key={blog._id} style={{ 
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--color-gray-700)', 
                borderRadius: 'var(--border-radius)', 
                padding: '16px', 
                width: '300px' 
            }}>
              <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>{blog.title}</h3>
              <p style={{color: 'var(--text-muted)'}}>By: {blog.author}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPostsSolution;
