import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { AuthButton } from './components/AuthButton';
import { Header } from './components/Header';
import { ConceptExplorer } from './components/ConceptExplorer';
import { LiveSupportProvider } from './contexts/LiveSupportContext';
import { LiveSupportButton } from './components/LiveSupport/LiveSupportButton';
import { LiveSupportModal } from './components/LiveSupport/LiveSupportModal';

export const App = () => {
  return (
    <AuthProvider>
      <LiveSupportProvider>
        <Box sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
          py: 4
        }}>
          <AuthButton />
          <Header />
          <ConceptExplorer />
          
          {/* Add these two new components */}
          <LiveSupportButton />
          <LiveSupportModal />

          {/* Existing shimmer animation */}
          <style jsx>{`
            @keyframes shimmer {
              0% { left: -100%; }
              100% { left: 100%; }
            }
          `}</style>
        </Box>
      </LiveSupportProvider>
    </AuthProvider>
  );
};