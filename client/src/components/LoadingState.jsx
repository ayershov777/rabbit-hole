import React from 'react';
import { Paper, Typography, LinearProgress, Box } from '@mui/material';

export const LoadingState = ({ loadingMessage, loadingProgress }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                mb: 4,
                border: '3px solid #e9ecef',
                borderRadius: 2,
                textAlign: 'center'
            }}
        >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a1a2e' }}>
                {loadingMessage}
            </Typography>
            <LinearProgress
                variant="determinate"
                value={loadingProgress}
                sx={{
                    height: 12,
                    borderRadius: 2,
                    border: '2px solid #1a1a2e',
                    '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #0066ff, #00b894)',
                        borderRadius: 0
                    }
                }}
            />
            <Typography variant="body2" sx={{ mt: 2, color: '#4a4a6a' }}>
                {Math.round(loadingProgress)}% complete
            </Typography>
        </Paper>
    );
};
