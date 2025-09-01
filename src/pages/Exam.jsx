import React, { useState } from 'react';
import BlogPostsSolution from '../features/exam/components/BlogPostsSolution';

const ExamPage = () => {
  const [studentCode, setStudentCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  const question = `
## React API Fetching Challenge

**Objective:**

Your task is to create a robust React component to fetch and display blog post data from an API endpoint. This will test your ability to handle asynchronous operations, manage state, and structure your code cleanly using custom hooks.

**API Endpoint:** 
https://highscore-tech-server.onrender.com/api/get-all-blogs

### Requirements:

1.  **Custom Hook (useFetchBlogs)**:
    *   Create a custom hook named useFetchBlogs.
    *   This hook must manage all state related to the API call: data, loading, and error.
    *   It should expose a function (e.g., executeFetch) to trigger the API call.
    *   The hook itself must **not** contain any JSX.

2.  **Loading Indicator (LoadingSpinner)**:
    *   Create a simple, stateless functional component named LoadingSpinner that displays a visual loading indicator. You can use CSS for animation.

3.  **Main Component (BlogPosts)**:
    *   Create a component named BlogPosts.
    *   This component must use your useFetchBlogs hook to get its data and state.
    *   It should display a "Fetch Blogs" button. The API call must **only** be triggered when this button is clicked.
    *   While the data is being fetched (i.e., loading is true), the LoadingSpinner component must be displayed.
    *   If an error occurs during the fetch, a user-friendly error message must be shown.
    *   On successful fetch, the list of blog posts should be rendered. For each post, display its title and author in a card-style format.

**Instructions:**

Write all three parts (useFetchBlogs, LoadingSpinner, and BlogPosts) in the text area below.
  `;

  return (
    <div style={{ 
        fontFamily: 'var(--font-family-sans)', 
        padding: 'var(--spacing-xl)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)'
    }}>
      <h1>React.js API Challenge</h1>
      <div style={{ 
          background: 'var(--bg-tertiary)', 
          border: '1px solid var(--primary-indigo)', 
          padding: '15px', 
          borderRadius: 'var(--border-radius)', 
          whiteSpace: 'pre-wrap',
          color: 'var(--text-secondary)'
      }}>
        {question}
      </div>

      <h2 style={{ marginTop: '30px' }}>Your Answer</h2>
      <textarea
        value={studentCode}
        onChange={(e) => setStudentCode(e.target.value)}
        placeholder="Enter your code for useFetchBlogs, LoadingSpinner, and BlogPosts here..."
        style={{ 
            width: '100%', 
            height: '400px',
            fontFamily: 'monospace',
            fontSize: '14px',
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--color-gray-700)',
            borderRadius: 'var(--border-radius)'
        }}
      />

      <button 
        onClick={() => setShowSolution(true)} 
        style={{ 
            marginTop: '20px', 
            padding: '10px 20px', 
            fontSize: '16px',
            background: 'var(--gradient-primary)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--border-radius)',
            border: 'none',
            cursor: 'pointer'
        }}
      >
        Deploy and See Solution
      </button>

      {showSolution && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{color: 'var(--text-primary)'}}>Solution Output</h2>
          <p style={{color: 'var(--text-secondary)'}}>This is the rendered output of the correct solution. You can interact with it.</p>
          <div style={{ 
              border: '1px solid var(--primary-cyan)', 
              borderRadius: 'var(--border-radius-lg)', 
              padding: 'var(--spacing-lg)' 
          }}>
            <BlogPostsSolution />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;