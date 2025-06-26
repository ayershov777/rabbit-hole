import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { AuthButton } from './components/AuthButton';
import { Header } from './components/Header';
import { ConceptExplorer } from './components/ConceptExplorer';

export const App = () => {
  return (
    <AuthProvider>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        py: 4
      }}>
        <AuthButton />
        <Header />
        <ConceptExplorer />

        {/* Shimmer Animation */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }
        `}</style>
      </Box>
    </AuthProvider>
  );
};
