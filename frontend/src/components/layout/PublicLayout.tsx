import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { AudioPlayerProvider } from '../../context/AudioPlayerContext';
import { GlobalPodcastPlayer } from '../media/GlobalPodcastPlayer';

export const PublicLayout: React.FC = () => {
  return (
    <AudioPlayerProvider>
      <Navbar />
      <main id="main-content" style={{ flex: 1, padding: '2rem 0' }}>
        <Outlet />
      </main>
      <GlobalPodcastPlayer />
      <Footer />
    </AudioPlayerProvider>
  );
};
