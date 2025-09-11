import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, Modal, IconButton } from '@mui/material';
import { Close as CloseIcon, VideoLibrary as VideoLibraryIcon, Image as ImageIcon } from '@mui/icons-material';
import axios from 'axios';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // TODO: Replace with your actual API endpoint
        // const response = await axios.get('/api/projects');
        // setProjects(response.data);
        
        // Mock data - This will be replaced with actual data from the admin
        const mockProjects = [
          {
            id: 1,
            title: 'E-commerce Platform',
            description: 'A full-featured e-commerce platform with payment integration',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            category: 'Web Development',
            technologies: ['React', 'Node.js', 'MongoDB']
          },
          // Add more mock projects as needed
        ];
        
        setProjects(mockProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleOpen = (project) => {
    setSelectedProject(project);
  };

  const handleClose = () => {
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
        <Typography className="text-white">Loading projects...</Typography>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] py-20 px-4 md:px-6">
      <Container maxWidth="xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 border border-[#2563eb]/30 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 bg-[#06b6d4] rounded-full mr-3 animate-pulse"></span>
            <span className="text-[#60a5fa] text-sm font-medium">Our Work</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white mb-6">
            <span className="bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] bg-clip-text text-transparent">
              Project Showcase
            </span>
          </h1>
          
          <p className="text-lg text-[#94a3b8] max-w-3xl mx-auto">
            Explore our portfolio of completed projects and see how we've helped businesses transform their ideas into reality.
          </p>
        </div>

        <Grid container spacing={4} className="mb-12">
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
              <Card 
                className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => handleOpen(project)}
              >
                <div className="relative pt-[75%] bg-black/20">
                  {project.type === 'video' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoLibraryIcon className="text-white text-4xl" />
                    </div>
                  ) : (
                    <CardMedia
                      component="img"
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      image={project.url}
                      alt={project.title}
                    />
                  )}
                </div>
                <div className="p-4">
                  <Typography variant="h6" className="text-white font-semibold mb-2">
                    {project.title}
                  </Typography>
                  <Typography variant="body2" className="text-[#94a3b8] mb-3">
                    {project.description}
                  </Typography>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.technologies?.map((tech, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs rounded-full bg-[#2563eb]/10 text-[#60a5fa]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Project Modal */}
        <Modal
          open={!!selectedProject}
          onClose={handleClose}
          className="flex items-center justify-center p-4"
        >
          <div className="bg-[#0f172a] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {selectedProject && (
              <div className="relative">
                <IconButton
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                >
                  <CloseIcon />
                </IconButton>
                
                <div className="relative pt-[56.25%] bg-black">
                  {selectedProject.type === 'video' ? (
                    <iframe
                      src={selectedProject.url}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedProject.title}
                    />
                  ) : (
                    <img
                      src={selectedProject.url}
                      alt={selectedProject.title}
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  )}
                </div>
                
                <div className="p-6">
                  <Typography variant="h4" className="text-white font-bold mb-2">
                    {selectedProject.title}
                  </Typography>
                  <Typography variant="body1" className="text-[#94a3b8] mb-4">
                    {selectedProject.description}
                  </Typography>
                  
                  {selectedProject.technologies && (
                    <div className="mt-4">
                      <Typography variant="subtitle2" className="text-[#60a5fa] mb-2">
                        Technologies Used:
                      </Typography>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 text-sm rounded-full bg-[#1e293b] text-[#60a5fa]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      </Container>
    </Box>
  );
};

export default Projects;
