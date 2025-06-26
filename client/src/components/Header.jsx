import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { Lightbulb } from 'lucide-react';

export const Header = () => {
    return (
        <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Lightbulb size={48} color="#1a1a2e" />
                </Box>
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        fontWeight: 900,
                        color: '#1a1a2e',
                        mb: 2,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 60,
                            height: 4,
                            background: 'linear-gradient(90deg, #0066ff, #00b894)',
                            borderRadius: 1
                        }
                    }}
                >
                    Concept Explorer
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        color: '#4a4a6a',
                        fontWeight: 500,
                        maxWidth: 600,
                        mx: 'auto'
                    }}
                >
                    Enter any concept and discover the detailed areas and components that make it up
                </Typography>
            </Box>
        </Container>
    );
};
