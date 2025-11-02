import React, { useState } from 'react';
import type { Module } from '../types';
import { ModuleType } from '../types';
import { 
    UploadIcon, PlaylistIcon, QRIcon, ThumbnailIcon, CodeIcon, 
    BroadcastIcon, ArchiveIcon, SponsorIcon, ChartIcon, SubtitleIcon 
} from './icons';
import {
    UploadManager, PlaylistBundler, QROverlayGenerator, ThumbnailCreator, DescriptionEncoder, DiasporaBroadcast, ArchiveToVault, SponsorGridSync, StatChartUploader, VoiceSubtitleSync
} from './modules';
import ModuleModal from './ModuleModal';

const modules: Module[] = [
  { id: ModuleType.UPLOAD_MANAGER, title: 'Upload Manager', description: 'Uploads episodes to YouTube with sovereign naming and metadata.', icon: UploadIcon, component: UploadManager },
  { id: ModuleType.PLAYLIST_BUNDLER, title: 'Playlist Bundler', description: 'Groups episodes into reform cycles and thematic playlists.', icon: PlaylistIcon, component: PlaylistBundler },
  { id: ModuleType.QR_OVERLAY_GENERATOR, title: 'QR Overlay Generator', description: 'Adds bilingual QR overlays to thumbnails and video frames.', icon: QRIcon, component: QROverlayGenerator },
  { id: ModuleType.THUMBNAIL_CREATOR, title: 'Thumbnail Creator', description: 'Generates reform-themed thumbnails with poster logic.', icon: ThumbnailIcon, component: ThumbnailCreator },
  { id: ModuleType.DESCRIPTION_ENCODER, title: 'Description Encoder', description: 'Writes bilingual, encrypted descriptions with legacy tags via AI.', icon: CodeIcon, component: DescriptionEncoder },
  { id: ModuleType.DIASPORA_BROADCAST, title: 'Diaspora Broadcast', description: 'Automates outreach to diaspora nodes (WhatsApp, Email).', icon: BroadcastIcon, component: DiasporaBroadcast },
  { id: ModuleType.ARCHIVE_TO_VAULT, title: 'Archive to Vault', description: 'Stores each episode in GN AI Vault with timestamp and reform tag.', icon: ArchiveIcon, component: ArchiveToVault },
  { id: ModuleType.SPONSOR_GRID_SYNC, title: 'Sponsor Grid Sync', description: 'Links sponsor onboarding logic to relevant episodes.', icon: SponsorIcon, component: SponsorGridSync },
  { id: ModuleType.STAT_CHART_UPLOADER, title: 'Stat Chart Uploader', description: 'Uploads pie/bar charts for reform impact analysis.', icon: ChartIcon, component: StatChartUploader },
  { id: ModuleType.VOICE_SUBTITLE_SYNC, title: 'Voice & Subtitle Sync', description: 'Syncs bilingual voice and subtitle overlays for episodes.', icon: SubtitleIcon, component: VoiceSubtitleSync },
];

const ModuleCard: React.FC<{ module: Module, onClick: () => void }> = ({ module, onClick }) => (
    <div 
        onClick={onClick}
        className="group bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer flex flex-col items-start transform hover:scale-105"
        style={{'--tw-shadow': '0 0 15px 0 rgba(0, 255, 255, 0.1)', boxShadow: 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)'} as React.CSSProperties}
    >
        <div className="flex items-center gap-4 mb-3">
            <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-600 group-hover:border-cyan-500 transition-colors">
                <module.icon className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{module.title}</h3>
        </div>
        <p className="text-gray-400 text-sm flex-grow">{module.description}</p>
        <div className="mt-4 text-cyan-500 text-sm font-medium group-hover:text-cyan-300 transition-colors flex items-center gap-2">
            Activate Ritual <span className="transform transition-transform group-hover:translate-x-1">&rarr;</span>
        </div>
    </div>
);

const Dashboard = () => {
    const [activeModule, setActiveModule] = useState<Module | null>(null);
    
    const openModal = (module: Module) => {
        setActiveModule(module);
    };

    const closeModal = () => {
        setActiveModule(null);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(module => (
                    <ModuleCard key={module.id} module={module} onClick={() => openModal(module)} />
                ))}
            </div>
            <ModuleModal module={activeModule} onClose={closeModal} />
        </>
    );
};

export default Dashboard;