
export enum ModuleType {
  UPLOAD_MANAGER = 'upload_manager',
  PLAYLIST_BUNDLER = 'playlist_bundler',
  QR_OVERLAY_GENERATOR = 'qr_overlay_generator',
  THUMBNAIL_CREATOR = 'thumbnail_creator',
  DESCRIPTION_ENCODER = 'description_encoder',
  DIASPORA_BROADCAST = 'diaspora_broadcast',
  ARCHIVE_TO_VAULT = 'archive_to_vault',
  SPONSOR_GRID_SYNC = 'sponsor_grid_sync',
  STAT_CHART_UPLOADER = 'stat_chart_uploader',
  VOICE_SUBTITLE_SYNC = 'voice_subtitle_sync',
}

export interface Module {
  id: ModuleType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

export interface EpisodeDetails {
  ep_number: string;
  title: string;
  lang: 'EN' | 'BN';
  date: string;
  theme: string;
  tags: string[];
}
