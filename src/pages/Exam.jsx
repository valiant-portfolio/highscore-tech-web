import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { okaidia } from '@uiw/codemirror-theme-okaidia';

const Exam = () => {
  const [activeTab, setActiveTab] = useState('question');
  const [htmlCode, setHtmlCode] = useState(
    `<!-- Your HTML structure goes here -->
    <div id="app">
      <h1>My To-Do List</h1>
      <form id="todo-form">
        <input type="text" id="todo-input" placeholder="Add a new task..." />
        <button type="submit">Add</button>
      </form>
      <ul id="todo-list"></ul>
    </div>`
  );
  const [cssCode, setCssCode] = useState(
    `/* Your CSS styles go here */
body {
  font-family: sans-serif;
  background-color: #f4f4f4;
  padding: 20px;
}

#app {
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.completed {
  text-decoration: line-through;
  color: #888;
}

li {
  cursor: move;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dragging {
  opacity: 0.5;
  background: #cce5ff;
}`
  );
  const [jsCode, setJsCode] = useState(
    `// Your JavaScript logic goes here
console.log("Implement the to-do list functionality!");`
  );

  const srcDoc = `
    <html>
      <body>${htmlCode}</body>
      <style>${cssCode}</style>
      <script>${jsCode}</script>
    </html>
  `;

  const challenge = {
    title: 'Interactive Draggable To-Do List',
    description:
      "Your mission is to build a fully functional to-do list application. You'll need to handle user input, manage a list of tasks, and implement drag-and-drop functionality to reorder them.",
    requirements: [
      "Add a new task to the list when the form is submitted.",
      "Remove a task when a 'delete' button is clicked (you'll need to create this button).",
      "Mark a task as 'completed' by adding a CSS class when its checkbox is clicked (you'll need to create the checkbox).",
      "Allow tasks to be reordered using drag-and-drop.",
      "BONUS: Persist the tasks in the browser's local storage so they don't disappear on page refresh.",
    ],
  };

  const TabButton = ({ name, label }) => (
    <button
      className={`px-4 py-2 font-semibold border-b-2 ${activeTab === name ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}
      onClick={() => setActiveTab(name)}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 bg-gray-800 shadow-md">
        <div className="flex items-center justify-start space-x-4 px-4">
            <TabButton name="question" label="Question" />
            <TabButton name="html" label="HTML" />
            <TabButton name="css" label="CSS" />
            <TabButton name="js" label="JavaScript" />
            <TabButton name="preview" label="Preview" />
        </div>
      </div>

      {/* Content Pane */}
      <div className="flex-grow overflow-auto">
        {activeTab === 'question' && (
          <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-cyan-400">{challenge.title}</h1>
            <p className="mb-6 text-lg text-gray-300">{challenge.description}</p>
            <h2 className="text-2xl font-semibold mb-3 text-cyan-400">Requirements:</h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-300">
              {challenge.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === 'html' && (
            <CodeMirror
                value={htmlCode}
                height="100%"
                extensions={[html()]}
                theme={okaidia}
                onChange={(value) => setHtmlCode(value)}
                className="h-full"
            />
        )}
        {activeTab === 'css' && (
            <CodeMirror
                value={cssCode}
                height="100%"
                extensions={[css()]}
                theme={okaidia}
                onChange={(value) => setCssCode(value)}
                className="h-full"
            />
        )}
        {activeTab === 'js' && (
            <CodeMirror
                value={jsCode}
                height="100%"
                extensions={[javascript({ jsx: true })]}
                theme={okaidia}
                onChange={(value) => setJsCode(value)}
                className="h-full"
            />
        )}
        {activeTab === 'preview' && (
            <iframe
                srcDoc={srcDoc}
                title="output"
                sandbox="allow-scripts allow-modals allow-forms"
                frameBorder="0"
                width="100%"
                height="100%"
                className="bg-white"
            />
        )}
      </div>
    </div>
  );
};

export default Exam;