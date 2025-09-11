import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, TextField, Typography, Paper, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import axios from 'axios';

const CHAT_VISIBILITY_KEY = 'chatVisibility';

const ChatModal = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Set page as loaded after a short delay
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
      // Check localStorage only after page load
      const saved = localStorage.getItem(CHAT_VISIBILITY_KEY);
      setIsOpen(saved !== 'false');
    }, 3000); // 1you d second delay after page load
    
    return () => clearTimeout(timer);
  }, []);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: 'Hello! How can I help you today?', 
      sender: 'admin',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    // Save the new state to localStorage
    localStorage.setItem(CHAT_VISIBILITY_KEY, newState);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      // Here you would typically send the message to your backend
      // const response = await axios.post('/api/chat', { message });
      
      // Simulate admin response
      setTimeout(() => {
        const adminResponse = {
          id: messages.length + 2,
          text: 'Thanks for your message! Our team will get back to you shortly.',
          sender: 'admin',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, adminResponse]);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isPageLoaded) return null;
  
  return (
    <>
      {!isOpen ? (
        <Box
          onClick={toggleChat}
          sx={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#3f51b5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            '&:hover': {
              backgroundColor: '#303f9f',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <ChatIcon sx={{ color: 'white', fontSize: 30 }} />
        </Box>
      ) : (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '380px',
            maxWidth: '90vw',
            height: 'calc(100vh - 4rem)',
            maxHeight: 'none',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#3f51b5',
              color: 'white',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Customer Support
            </Typography>
            <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              backgroundColor: '#f5f5f5',
              minHeight: '400px',
              maxHeight: 'calc(100vh - 180px)',
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  {msg.sender === 'admin' && (
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        marginRight: 1,
                        backgroundColor: '#3f51b5',
                        fontSize: '0.75rem',
                      }}
                    >
                      CS
                    </Avatar>
                  )}
                  <Box>
                    <Box
                      sx={{
                        backgroundColor: msg.sender === 'user' ? '#3f51b5' : '#e0e0e0',
                        color: msg.sender === 'user' ? 'white' : 'black',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        wordBreak: 'break-word',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {msg.text}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                        color: '#757575',
                        fontSize: '0.65rem',
                        marginTop: '4px',
                      }}
                    >
                      {msg.timestamp}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              display: 'flex',
              padding: '12px',
              borderTop: '1px solid #e0e0e0',
              backgroundColor: 'white',
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3f51b5',
                  },
                },
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              sx={{
                marginLeft: '8px',
                backgroundColor: '#3f51b5',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#303f9f',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatModal;
