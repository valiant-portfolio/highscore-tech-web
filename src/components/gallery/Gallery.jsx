import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, Modal, IconButton } from '@mui/material';
import { Close as CloseIcon, VideoLibrary as VideoLibraryIcon, Image as ImageIcon } from '@mui/icons-material';
import axios from 'axios';

const Gallery = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        // Replace with your actual API endpoint
        // const response = await axios.get('/api/gallery');
        // setMediaItems(response.data);
        
        // Mock data with placeholder images
        setMediaItems([
          { 
            id: 1, 
            type: 'image', 
            url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
            title: 'Coding Workshop',
            description: 'Students learning web development'
          },
          { 
            id: 2, 
            type: 'image', 
            url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
            title: 'Team Project',
            description: 'Collaborative coding session'
          },
          { 
            id: 3, 
            type: 'video', 
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
            title: 'Introduction to React',
            description: 'Learn the basics of React.js'
          },
          { 
            id: 4, 
            type: 'image', 
            url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
            title: 'Code Review',
            description: 'Mentors providing code feedback'
          },
          { 
            id: 5, 
            type: 'image', 
            url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
            title: 'Graduation Day',
            description: 'Celebrating our graduates'
          },
          { 
            id: 6, 
            type: 'video', 
            url: 'https://www.youtube.com/embed/1Rs2ND1ryYc', 
            title: 'JavaScript Fundamentals',
            description: 'Master the basics of JavaScript'
          },
        ]);
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const handleOpen = (media) => setSelectedMedia(media);
  const handleClose = () => setSelectedMedia(null);

  if (loading) {
    return (
      <Box py={8} textAlign="center">
        <Typography>Loading gallery...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
      paddingTop: { xs: '120px', sm: '100px' }, // Extra space for fixed navbar
      paddingBottom: '64px',
      minHeight: '100vh'
    }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8} pt={2}>
          <Typography variant="h3" component="h1" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            mb: 2,
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Our Gallery
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#94a3b8', maxWidth: '700px', mx: 'auto' }}>
            Explore moments from our workshops, events, and student achievements. Click on any image or video to view it in full size.
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ width: '100%', margin: 0, padding: { xs: 0, sm: 2 } }}>
          {mediaItems.map((item) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={item.id} 
              sx={{ 
                padding: { xs: '0 !important', sm: '12px !important' },
                width: { xs: '100%', sm: 'auto' },
                margin: { xs: '0 0 12px 0', sm: '0' }
              }}
            >
              <Card 
                onClick={() => handleOpen(item)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'transform 0.3s',
                  width: '100%',
                  margin: '0 auto',
                  '&:hover': {
                    transform: 'scale(1.03)',
                  },
                  '@media (max-width: 600px)': {
                    borderRadius: 0,
                    '&:hover': {
                      transform: 'none',
                    },
                  },
                }}
              >
                {item.type === 'image' ? (
                  <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                    <CardMedia
                      component="img"
                      image={item.url}
                      alt={item.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000',
                      }}
                    >
                      <VideoLibraryIcon sx={{ fontSize: 60, color: 'white' }} />
                    </Box>
                  </Box>
                )}
                <Box p={2} sx={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}>
                  <Typography variant="subtitle1" fontWeight="bold">{item.title}</Typography>
                  <Typography variant="body2" color="#94a3b8" noWrap>{item.description}</Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Media Modal */}
        <Modal
          open={!!selectedMedia}
          onClose={handleClose}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '95%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 1,
              outline: 'none',
              '&:focus': {
                outline: 'none',
              },
              '@media (max-width: 600px)': {
                width: '100%',
                height: '100%',
                maxHeight: '100vh',
                borderRadius: 0,
              },
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            
            {selectedMedia && (
              <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: '100%', overflow: 'hidden' }}>
                {selectedMedia.type === 'image' ? (
                  <Box sx={{ width: '100%', overflow: 'hidden' }}>
                    <img 
                      src={selectedMedia.url} 
                      alt={selectedMedia.title || 'Gallery image'} 
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        display: 'block',
                        maxWidth: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ 
                    position: 'relative', 
                    paddingBottom: '56.25%', 
                    height: 0, 
                    overflow: 'hidden',
                    width: '100%',
                    maxWidth: '100%'
                  }}>
                    <iframe
                      src={selectedMedia.url}
                      title={selectedMedia.title || 'Gallery video'}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        maxWidth: '100%'
                      }}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </Box>
                )}
                <Box sx={{ mt: 2, px: { xs: 1, sm: 0 } }}>
                  {selectedMedia.title && (
                    <Typography variant="h6" component="h2" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                      {selectedMedia.title}
                    </Typography>
                  )}
                  {selectedMedia.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                      {selectedMedia.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default Gallery;
