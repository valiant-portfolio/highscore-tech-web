import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box } from '@mui/material';

const Projects = () => {
  // Sample project data - replace with your actual projects data
  const projects = [
    {
      id: 1,
      title: 'Project 1',
      description: 'Description of project 1',
      image: 'https://via.placeholder.com/300x200',
      link: '/project/1'
    },
    {
      id: 2,
      title: 'Project 2',
      description: 'Description of project 2',
      image: 'https://via.placeholder.com/300x200',
      link: '/project/2'
    },
    {
      id: 3,
      title: 'Project 3',
      description: 'Description of project 3',
      image: 'https://via.placeholder.com/300x200',
      link: '/project/3'
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 6, fontWeight: 'bold' }}>
        Our Projects
      </Typography>
      
      <Grid container spacing={4}>
        {projects.map((project) => (
          <Grid item key={project.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardMedia
                component="img"
                height="200"
                image={project.image}
                alt={project.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {project.title}
                </Typography>
                <Typography>
                  {project.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <a href={project.link} style={{ textDecoration: 'none', color: '#1976d2' }}>
                  View Project →
                </a>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Projects;
