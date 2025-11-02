import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { generateYouTubeDescription } from '../services/geminiService';
import { uploadManager as uploadVideoToYouTube } from '../services/youtubeService';
import { diasporaBroadcast, BroadcastResult } from '../services/outreachService';
import { archiveToVault, ArchiveResult } from '../services/vaultService';
import { getSponsors, linkSponsorToEpisode, Sponsor } from '../services/sponsorService';
import { useAppContext } from '../context/AppContext';
import type { EpisodeDetails } from '../types';
import { TerminalIcon, CopyIcon, QRIcon, CodeIcon, PlusCircleIcon, PlaylistIcon, WhatsAppIcon, EmailIcon, SendIcon, ThumbnailIcon, ClockIcon } from './icons';

const baseInputClasses = "mt-1 block w-full bg-gray-700/50 border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition";
const baseButtonClasses = "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-500/50 disabled:cursor-not-allowed transition";

const PlaceholderComponent: React.FC<{ name: string }> = ({ name }) => (
  <div className="bg-gray-900/50 p-6 rounded-lg border border-dashed border-gray-600 text-center flex flex-col items-center justify-center h-48">
    <TerminalIcon className="w-12 h-12 text-gray-500 mb-4"/>
    <h3 className="text-lg font-semibold text-gray-400 font-mono">MODULE OFFLINE</h3>
    <p className="text-gray-500 mt-2">The interface for {name.toLowerCase()} is awaiting directives.</p>
  </div>
);

export const UploadManager = () => {
    const { setActiveEpisode } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [epNumber, setEpNumber] = useState('56');
    const [title, setTitle] = useState('CivicTechIntegration');
    const [lang, setLang] = useState('EN');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('Episode 56: Deep dive into the integration of civic technology platforms for transparent governance. #GNLegacy #Cycle3 #CivicTech');
    const [tags, setTags] = useState('GN AI, Civic Tech, Cycle 3, Governance, Transparency, EN, QR Broadcast');
    
    const [uploading, setUploading] = useState(false);
    const [uploadResponse, setUploadResponse] = useState<{ id: string } | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setUploadResponse(null);
            setApiError(null);
            if (errors.file) {
                setErrors(prev => ({ ...prev, file: '' }));
            }
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!epNumber || parseInt(epNumber) <= 0) {
            newErrors.ep_number = "Episode number must be a positive number.";
        }
        if (!title.trim()) newErrors.title = "Title is required.";
        if (!date) newErrors.date = "Date is required.";
        if (!description.trim()) newErrors.description = "Description is required.";
        if (!tags.trim()) newErrors.tags = "At least one tag is required.";
        if (!file) newErrors.file = "A video file must be selected for upload.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setUploading(true);
        setUploadResponse(null);
        setApiError(null);
        
        try {
            const metadata = {
                ep_number: epNumber,
                title: title,
                lang: lang,
                description: description,
                tags: tags.split(',').map(t => t.trim()),
            };
            const response = await uploadVideoToYouTube(file!, metadata);
            setUploadResponse(response);
            setActiveEpisode({ ep_number: epNumber, title: title, youtubeId: response.id });
        } catch (err: any) {
            setApiError(err.message || 'An unknown error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setter(e.target.value);
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const ritualizedFilename = file ? `GN-Ep${epNumber}-${title}-${date}-${lang}-QR.mp4` : 'No file selected';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Episode Number</label>
                    <input type="number" value={epNumber} onChange={handleInputChange(setEpNumber, 'ep_number')} className={`${baseInputClasses} ${errors.ep_number ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500'}`} />
                    {errors.ep_number && <p className="mt-1 text-sm text-red-400">{errors.ep_number}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400">Title (CamelCase)</label>
                    <input type="text" value={title} onChange={handleInputChange(setTitle, 'title')} className={`${baseInputClasses} ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500'}`} />
                    {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400">Language</label>
                    <select value={lang} onChange={e => setLang(e.target.value)} className={`${baseInputClasses} border-gray-600 focus:border-cyan-500`}>
                        <option>EN</option>
                        <option>BN</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400">Date</label>
                    <input type="date" value={date} onChange={handleInputChange(setDate, 'date')} className={`${baseInputClasses} ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500'}`} />
                    {errors.date && <p className="mt-1 text-sm text-red-400">{errors.date}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                <textarea id="description" value={description} onChange={handleInputChange(setDescription, 'description')} className={`${baseInputClasses} h-24 resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500'}`} />
                {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
            </div>
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-400">Tags (comma-separated)</label>
                <input id="tags" type="text" value={tags} onChange={handleInputChange(setTags, 'tags')} className={`${baseInputClasses} ${errors.tags ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500'}`} />
                {errors.tags && <p className="mt-1 text-sm text-red-400">{errors.tags}</p>}
            </div>
            
            <div>
                 <label className="block text-sm font-medium text-gray-400">Video File</label>
                 <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition ${errors.file ? 'border-red-500' : 'border-gray-600 hover:border-cyan-500'}`}>
                    <div className="space-y-1 text-center">
                         <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-cyan-500 px-2">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="video/mp4,video/mpeg"/>
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">{file ? file.name : 'MP4, MPEG up to 1GB'}</p>
                    </div>
                </div>
                {errors.file && <p className="mt-1 text-sm text-red-400">{errors.file}</p>}
            </div>

            <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                <p className="text-sm text-gray-400">Ritualized Filename:</p>
                <p className="font-mono text-cyan-300 break-all">{ritualizedFilename}</p>
            </div>
            
            <div className="text-right">
                <button type="submit" disabled={uploading} className={baseButtonClasses}>
                    {uploading ? 'Uploading...' : 'Initiate Upload Ritual'}
                </button>
            </div>
            
            {uploadResponse && (
                <div className="p-4 bg-green-900/50 border border-green-700 rounded-md text-green-300">
                    <p>✅ Upload complete for: {ritualizedFilename}</p>
                    <p className="mt-2">
                        🔗 Watch here: 
                        <a href={`https://www.youtube.com/watch?v=${uploadResponse.id}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-white ml-1">
                            {`https://www.youtube.com/watch?v=${uploadResponse.id}`}
                        </a>
                    </p>
              </div>
            )}
            {apiError && <div className="p-4 bg-red-900/50 border border-red-700 rounded-md text-red-300">❌ Upload failed: {apiError}</div>}
        </form>
    );
};

const initialPlaylists = [
    { id: 'PL-C1', name: 'Cycle1_CollapseToCurriculum', videoIds: ['Ep01', 'Ep02', 'Ep03', 'Ep15'] },
    { id: 'PL-C2', name: 'Cycle2_ConstitutionToDiaspora', videoIds: ['Ep16', 'Ep24', 'Ep30'] },
    { id: 'PL-SO', name: 'Sponsor_Onboarding', videoIds: ['S01', 'S02'] },
    { id: 'PL-FS', name: 'FoodSafety_Surveillance', videoIds: ['Ep42', 'Ep48'] },
];

export const PlaylistBundler = () => {
    const { activeEpisode } = useAppContext();
    const [playlists, setPlaylists] = useState(initialPlaylists);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(playlists[0].id);
    const [episodeId, setEpisodeId] = useState('');
    const [lastAdded, setLastAdded] = useState<{ playlistName: string; episodeId: string } | null>(null);
    
    useEffect(() => {
        if (activeEpisode) {
            setEpisodeId(`Ep${activeEpisode.ep_number}_${activeEpisode.title}`);
        } else {
            setEpisodeId('Ep56_CivicTech'); // Fallback
        }
    }, [activeEpisode]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlaylistId || !episodeId) return;

        setPlaylists(prevPlaylists =>
            prevPlaylists.map(playlist => {
                if (playlist.id === selectedPlaylistId && !playlist.videoIds.includes(episodeId)) {
                    return { ...playlist, videoIds: [...playlist.videoIds, episodeId] };
                }
                return playlist;
            })
        );
        
        const playlistName = playlists.find(p => p.id === selectedPlaylistId)?.name || '';
        setLastAdded({ playlistName, episodeId });
        setEpisodeId(''); // Clear input for next entry
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Add Episode to Cycle</h3>
                <form onSubmit={handleSubmit} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                        <label htmlFor="episodeId" className="sr-only">Episode ID</label>
                        <input id="episodeId" value={episodeId} onChange={e => setEpisodeId(e.target.value)} placeholder="Enter Episode ID (e.g., Ep56)" className={baseInputClasses + ' mt-0 border-gray-600'}/>
                    </div>
                    <div className="flex-1 w-full">
                        <label htmlFor="playlist" className="sr-only">Playlist</label>
                        <select id="playlist" value={selectedPlaylistId} onChange={e => setSelectedPlaylistId(e.target.value)} className={baseInputClasses + ' mt-0 border-gray-600'}>
                             {playlists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className={`${baseButtonClasses} w-full md:w-auto`}>
                        <PlusCircleIcon className="w-5 h-5 mr-2"/>
                        Bundle Episode
                    </button>
                </form>
                 {lastAdded && (
                    <div className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-md text-green-300 text-sm">
                        ✅ Successfully bundled episode '{lastAdded.episodeId}' into playlist '{lastAdded.playlistName}'.
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Active Playlist Cycles</h3>
                <div className="space-y-3">
                    {playlists.map(playlist => (
                        <div key={playlist.id} className="bg-gray-800/60 p-4 rounded-lg flex items-center justify-between border border-gray-700 hover:border-cyan-500/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <PlaylistIcon className="w-6 h-6 text-cyan-400" />
                                <span className="font-mono text-white">{playlist.name}</span>
                            </div>
                            <div className="text-sm font-medium bg-gray-700/50 text-cyan-300 px-3 py-1 rounded-full">
                                {playlist.videoIds.length} Episodes
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const QROverlayGenerator = () => {
    const { activeEpisode } = useAppContext();
    const [config, setConfig] = useState({
        episodeNumber: '42',
        linkDestination: 'reform_form',
        customUrl: '',
        ctaEnglish: 'Scan for Civic Action',
        ctaBangla: 'নাগরিক কর্মের জন্য স্ক্যান করুন',
    });
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (activeEpisode) {
            setConfig(prev => ({ ...prev, episodeNumber: activeEpisode.ep_number }));
        }
    }, [activeEpisode]);

    const targetUrl = useMemo(() => {
        const { episodeNumber, linkDestination, customUrl } = config;
        switch (linkDestination) {
            case 'reform_form': return `https://example.com/reform-form/ep${episodeNumber}`;
            case 'sponsor_grid': return `https://example.com/sponsor-grid/ep${episodeNumber}`;
            case 'curriculum': return `https://example.com/curriculum/ep${episodeNumber}`;
            case 'custom': return customUrl;
            default: return '';
        }
    }, [config]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
        setQrCodeUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (config.linkDestination === 'custom' && !config.customUrl) {
            setError('A custom URL must be provided.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setQrCodeUrl(null);

        try {
            const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(targetUrl)}`);
            if (!response.ok) {
                throw new Error('QR code service is unavailable.');
            }
            setQrCodeUrl(response.url);
        } catch (err: any) {
            setError(err.message || 'Failed to generate QR code.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="episodeNumber" className="block text-sm font-medium text-gray-400">Episode Number</label>
                    <input id="episodeNumber" name="episodeNumber" type="number" value={config.episodeNumber} onChange={handleInputChange} className={`${baseInputClasses} border-gray-600`} />
                </div>
                <div>
                    <label htmlFor="linkDestination" className="block text-sm font-medium text-gray-400">QR Code Destination</label>
                    <select id="linkDestination" name="linkDestination" value={config.linkDestination} onChange={handleInputChange} className={`${baseInputClasses} border-gray-600`}>
                        <option value="reform_form">Reform Form</option>
                        <option value="sponsor_grid">Sponsor Grid</option>
                        <option value="curriculum">Curriculum</option>
                        <option value="custom">Custom URL</option>
                    </select>
                </div>
                {config.linkDestination === 'custom' && (
                    <div>
                        <label htmlFor="customUrl" className="block text-sm font-medium text-gray-400">Custom URL</label>
                        <input id="customUrl" name="customUrl" type="url" placeholder="https://your-link.com" value={config.customUrl} onChange={handleInputChange} className={`${baseInputClasses} border-gray-600`} />
                    </div>
                )}
                <div>
                    <label htmlFor="ctaEnglish" className="block text-sm font-medium text-gray-400">English Call to Action</label>
                    <input id="ctaEnglish" name="ctaEnglish" type="text" value={config.ctaEnglish} onChange={handleInputChange} className={`${baseInputClasses} border-gray-600`} />
                </div>
                 <div>
                    <label htmlFor="ctaBangla" className="block text-sm font-medium text-gray-400">Bangla Call to Action</label>
                    <input id="ctaBangla" name="ctaBangla" type="text" value={config.ctaBangla} onChange={handleInputChange} className={`${baseInputClasses} border-gray-600`} />
                </div>
                
                <button type="submit" disabled={isLoading} className={`${baseButtonClasses} w-full`}>
                    {isLoading ? 'Generating...' : 'Generate QR Overlay'}
                </button>

                {error && <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-sm">{error}</div>}
            </form>

            <div className="space-y-4">
                 <label className="block text-sm font-medium text-gray-400 text-center">Live Preview</label>
                 <div className={`w-full aspect-video rounded-lg overflow-hidden border-2 ${qrCodeUrl ? 'border-cyan-500' : 'border-gray-600'} transition-colors shadow-lg relative bg-gray-900 flex items-center justify-center`}>
                    <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1770&auto=format&fit=crop" alt="Video frame background" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                    
                    {!qrCodeUrl && !isLoading && (
                        <div className="text-center text-gray-500 z-10">
                            <QRIcon className="w-16 h-16 mx-auto mb-2" />
                            <p>Preview will appear here</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="z-10 animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                    )}
                    
                    {qrCodeUrl && (
                         <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/20 flex items-center gap-4 z-20">
                            <img src={qrCodeUrl} alt="Generated QR Code" className="w-24 h-24 rounded-md bg-white p-1" />
                            <div className="text-white">
                                <p className="font-bold text-lg">{config.ctaEnglish}</p>
                                <p className="text-md">{config.ctaBangla}</p>
                            </div>
                        </div>
                    )}
                </div>
                 {qrCodeUrl && <div className="p-3 text-center bg-green-900/50 border border-green-700 rounded-md text-green-300 text-sm">✅ QR Overlay generated for Episode {config.episodeNumber}.</div>}
            </div>
        </div>
    );
};

const themes = {
    collapse: {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
        accent: 'text-red-400',
        title: 'text-white',
        subtitle: 'text-gray-300',
    },
    curriculum: {
        bg: 'bg-gradient-to-br from-blue-900 via-gray-900 to-cyan-900',
        accent: 'text-cyan-400',
        title: 'text-white',
        subtitle: 'text-blue-200',
    },
    diaspora: {
        bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900',
        accent: 'text-amber-400',
        title: 'text-white',
        subtitle: 'text-indigo-200',
    }
}

export const ThumbnailCreator = () => {
    const { activeEpisode } = useAppContext();
    const [details, setDetails] = useState({
        ep_number: '42',
        title_en: 'Food Safety',
        title_bn: 'খাদ্য নিরাপত্তা',
        theme: 'curriculum' as keyof typeof themes,
    });
    const [generated, setGenerated] = useState(false);
    
    useEffect(() => {
        if (activeEpisode) {
            setDetails(prev => ({ ...prev, ep_number: activeEpisode.ep_number, title_en: activeEpisode.title }));
        }
    }, [activeEpisode]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({...prev, [name]: value}));
        setGenerated(false);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setGenerated(true);
    };

    const selectedTheme = themes[details.theme];
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="ep_number" className="block text-sm font-medium text-gray-400">Episode Number</label>
                    <input id="ep_number" name="ep_number" type="number" value={details.ep_number} onChange={handleInputChange} className={`${baseInputClasses} border-gray-600`} />
                </div>
                <div>
                    <label htmlFor="title_en" className="block text-sm font-medium text-gray-400">English Title</label>
                    <input id="title_en" name="title_en" type="text" value={details.title_en} onChange={handleInputChange} className={`${baseInputClasses} border-gray-600`} />
                </div>
                <div>
                    <label htmlFor="title_bn" className="block text-sm font-medium text-gray-400">Bangla Title</label>
                    <input id="title_bn" name="title_bn" type="text" value={details.title_bn} onChange={handleInputChange} className={`${baseInputClasses} border-gray-600`} />
                </div>
                <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-400">Visual Theme</label>
                    <select id="theme" name="theme" value={details.theme} onChange={handleInputChange} className={`${baseInputClasses} border-gray-600`}>
                        <option value="curriculum">Curriculum</option>
                        <option value="collapse">Collapse</option>
                        <option value="diaspora">Diaspora</option>
                    </select>
                </div>
                <div className="flex gap-4">
                     <button type="submit" className={`${baseButtonClasses} flex-1`}>
                        Generate Thumbnail
                    </button>
                    <button type="button" disabled={!generated} className={`${baseButtonClasses} bg-gray-600 hover:bg-gray-700 focus:ring-gray-500`}>
                        Download
                    </button>
                </div>
            </form>
            <div className="space-y-4">
                 <label className="block text-sm font-medium text-gray-400 text-center">Live Preview</label>
                <div className={`w-full aspect-video rounded-lg overflow-hidden border-2 ${generated ? 'border-cyan-500' : 'border-gray-600'} transition-colors shadow-lg`}>
                    <div className={`relative w-full h-full p-6 flex flex-col justify-between ${selectedTheme.bg}`}>
                        <div className="absolute inset-0 bg-black/30"></div>
                        
                        <div className="relative flex justify-between items-start">
                             <div className={`font-mono ${selectedTheme.accent}`}>
                                <span className="text-sm">EPISODE</span>
                                <p className="text-6xl font-bold tracking-tighter leading-none">{details.ep_number.padStart(2, '0')}</p>
                            </div>
                             <div className="bg-white p-1 rounded-sm w-16 h-16 flex items-center justify-center">
                                <QRIcon className="w-full h-full text-black"/>
                            </div>
                        </div>

                        <div className="relative flex justify-between items-end">
                             <CodeIcon className={`w-12 h-12 ${selectedTheme.accent}`} />
                             <div className="text-right">
                                <h2 className={`text-4xl font-extrabold ${selectedTheme.title} leading-tight`}>{details.title_en}</h2>
                                <h3 className={`text-2xl font-semibold ${selectedTheme.subtitle}`}>{details.title_bn}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                 {generated && <div className="p-3 text-center bg-green-900/50 border border-green-700 rounded-md text-green-300 text-sm">✅ Thumbnail generated with '{details.theme}' theme.</div>}
            </div>
        </div>
    );
};

export const DiasporaBroadcast = () => {
    const { activeEpisode } = useAppContext();
    const defaultMessage = (epNum: string) => `Greetings Diaspora Node,

GN AI Authority has released Episode ${epNum}. This broadcast covers critical updates on our reform initiatives.

Engage with the material, share within your network, and utilize the QR code for direct access to the civic action form.

Your participation is integral.

#GNLegacy #DiasporaJustice`;

    const [episodeNumber, setEpisodeNumber] = useState('42');
    const [channels, setChannels] = useState({ WhatsApp: true, Email: true, FlushingNode: false });
    const [message, setMessage] = useState(defaultMessage('42'));
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [broadcastLog, setBroadcastLog] = useState<BroadcastResult[]>([]);
    
    useEffect(() => {
        if (activeEpisode) {
            setEpisodeNumber(activeEpisode.ep_number);
            setMessage(defaultMessage(activeEpisode.ep_number));
        }
    }, [activeEpisode]);


    const handleEpisodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = e.target.value;
        setEpisodeNumber(num);
        setMessage(defaultMessage(num));
    };

    const handleChannelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setChannels(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedChannels = Object.entries(channels).filter(([, isSelected]) => isSelected).map(([name]) => name);
        if (selectedChannels.length === 0) return;

        setIsBroadcasting(true);
        setBroadcastLog([]);

        await diasporaBroadcast(
            { episodeNumber, message, channels: selectedChannels },
            (progress) => {
                setBroadcastLog(prev => [...prev, progress]);
            }
        );

        setIsBroadcasting(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="ep_number_broadcast" className="block text-sm font-medium text-gray-400">Target Episode Number</label>
                    <input id="ep_number_broadcast" type="number" value={episodeNumber} onChange={handleEpisodeChange} className={`${baseInputClasses} border-gray-600`} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Broadcast Channels</label>
                    <div className="mt-2 space-y-2 bg-gray-900/50 p-3 rounded-md border border-gray-700">
                        {Object.entries({ WhatsApp: WhatsAppIcon, Email: EmailIcon, FlushingNode: SendIcon }).map(([id, Icon]) => (
                            <label key={id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name={id}
                                    checked={channels[id as keyof typeof channels]}
                                    onChange={handleChannelChange}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600"
                                />
                                <Icon className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-300">{id.replace('Node', ' Node')}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-400">Outreach Message</label>
                    <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} className={`${baseInputClasses} h-48 resize-none font-mono border-gray-600`} />
                </div>
                <button type="submit" disabled={isBroadcasting} className={`${baseButtonClasses} w-full`}>
                    {isBroadcasting ? 'Broadcasting...' : 'Initiate Diaspora Broadcast'}
                </button>
            </form>
            
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400 text-center">Broadcast Preview & Log</label>
                <div className="w-full bg-gray-900/50 rounded-lg border border-gray-700 p-4">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center">
                            <ThumbnailIcon className="w-12 h-12 text-gray-500"/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-white">GN AI Authority</h4>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{message.substring(0, 150)}{message.length > 150 ? '...' : ''}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 p-2 bg-gray-800/50 rounded-md">
                        <div className="w-10 h-10 bg-white p-1 rounded-sm flex items-center justify-center">
                            <QRIcon className="w-full h-full text-black"/>
                        </div>
                        <div className="text-xs text-gray-400">
                            <p className="font-bold text-gray-300">Scan for Civic Action</p>
                            <p>Direct Link to Reform Initiative</p>
                        </div>
                    </div>
                </div>

                {(isBroadcasting || broadcastLog.length > 0) && (
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4 space-y-2 font-mono text-sm">
                        <p className="text-cyan-400 animate-pulse">
                          {isBroadcasting ? '>> BROADCAST IN PROGRESS...' : '>> BROADCAST COMPLETE.'}
                        </p>
                        {broadcastLog.map((log, index) => (
                           <div key={index} className={`flex items-center gap-2 ${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                               <span>{log.status === 'success' ? '✅' : '❌'}</span>
                               <span>{log.message}</span>
                           </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export const ArchiveToVault = () => {
    const { activeEpisode } = useAppContext();
    const [episodeNumber, setEpisodeNumber] = useState('57');
    const [theme, setTheme] = useState('Civic Tech');
    const [tags, setTags] = useState('GNLegacy, Cycle3, CivicTech, Vaulted');
    
    const [isArchiving, setIsArchiving] = useState(false);
    const [archiveLog, setArchiveLog] = useState<string[]>([]);
    const [archiveResult, setArchiveResult] = useState<ArchiveResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (activeEpisode) {
            setEpisodeNumber(activeEpisode.ep_number);
        }
    }, [activeEpisode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsArchiving(true);
        setArchiveLog([]);
        setArchiveResult(null);
        setError(null);

        try {
            const result = await archiveToVault(
                { episodeNumber, theme, tags: tags.split(',').map(t => t.trim()) },
                (logMessage) => {
                    setArchiveLog(prev => [...prev, logMessage]);
                }
            );
            setArchiveResult(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during archival.');
        } finally {
            setIsArchiving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="archive_ep_number" className="block text-sm font-medium text-gray-400">Episode Number to Archive</label>
                    <input id="archive_ep_number" type="number" value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value)} className={`${baseInputClasses} border-gray-600`} />
                </div>
                <div>
                    <label htmlFor="archive_theme" className="block text-sm font-medium text-gray-400">Reform Theme</label>
                    <select id="archive_theme" value={theme} onChange={e => setTheme(e.target.value)} className={`${baseInputClasses} border-gray-600`}>
                        <option>Civic Tech</option>
                        <option>Food Safety</option>
                        <option>Diaspora Justice</option>
                        <option>Constitutional Reform</option>
                        <option>Sponsor Onboarding</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="archive_tags" className="block text-sm font-medium text-gray-400">Legacy Tags (comma-separated)</label>
                    <input id="archive_tags" type="text" value={tags} onChange={e => setTags(e.target.value)} className={`${baseInputClasses} border-gray-600`} />
                </div>
                <button type="submit" disabled={isArchiving} className={`${baseButtonClasses} w-full`}>
                    {isArchiving ? 'Archiving...' : 'Commit to Vault'}
                </button>
            </form>

            <div className="space-y-4">
                 <label className="block text-sm font-medium text-gray-400 text-center">Archival Log & Confirmation</label>
                 <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4 min-h-[160px] font-mono text-sm space-y-1">
                    {(isArchiving || archiveLog.length > 0) && archiveLog.map((log, index) => (
                        <p key={index} className={`${log.includes('FAILED') ? 'text-red-400' : 'text-cyan-400'}`}>
                           {log}
                        </p>
                    ))}
                    {!isArchiving && archiveLog.length === 0 && (
                        <p className="text-gray-500 text-center pt-8">Awaiting archival command...</p>
                    )}
                 </div>
                 
                 {error && <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-sm">❌ Archival failed: {error}</div>}
                 
                 {archiveResult && (
                     <div className="p-4 bg-green-900/50 border border-green-700 rounded-md">
                        <h4 className="font-bold text-green-300 text-base mb-2">✅ Vault Confirmation Receipt</h4>
                        <div className="font-mono text-xs space-y-2 text-green-200">
                             <p><strong>Confirmation ID:</strong> {archiveResult.confirmationId}</p>
                             <p><strong>Timestamp (UTC):</strong> {archiveResult.timestamp}</p>
                             <p className="break-all"><strong>Vault Path:</strong> {archiveResult.vaultPath}</p>
                        </div>
                     </div>
                 )}
            </div>
        </div>
    );
};

export const SponsorGridSync = () => {
    const { activeEpisode } = useAppContext();
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedSponsor, setSelectedSponsor] = useState('');
    const [episodeNumber, setEpisodeNumber] = useState('57');
    const [error, setError] = useState<string | null>(null);
    const [syncResult, setSyncResult] = useState<{ link: string, qrUrl: string, sponsorName: string } | null>(null);

    useEffect(() => {
        const fetchSponsors = async () => {
            setIsLoading(true);
            try {
                const data = await getSponsors();
                setSponsors(data);
                if (data.length > 0) {
                    setSelectedSponsor(data.find(s => s.status === 'Pending')?.id || data[0].id);
                }
            } catch (err) {
                setError('Failed to fetch sponsor grid.');
            }
            setIsLoading(false);
        };
        fetchSponsors();
    }, []);
    
    useEffect(() => {
        if (activeEpisode) {
            setEpisodeNumber(activeEpisode.ep_number);
        }
    }, [activeEpisode]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSponsor || !episodeNumber) return;

        setIsSyncing(true);
        setError(null);
        setSyncResult(null);

        try {
            const updatedSponsors = await linkSponsorToEpisode(selectedSponsor, episodeNumber);
            setSponsors(updatedSponsors);

            const sponsor = updatedSponsors.find(s => s.id === selectedSponsor);
            if (!sponsor) throw new Error("Sponsor not found after update.");
            
            const onboardingLink = `https://example.com/onboard/${sponsor.name.replace(/\s+/g, '-')}/${sponsor.linkedEpisode}`;
            const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(onboardingLink)}`);
            if (!qrResponse.ok) throw new Error('QR code service is unavailable.');

            setSyncResult({
                link: onboardingLink,
                qrUrl: qrResponse.url,
                sponsorName: sponsor.name,
            });
            
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during sync.');
        } finally {
            setIsSyncing(false);
        }
    };
    
    const getStatusClass = (status: Sponsor['status']) => {
        switch (status) {
            case 'Onboarded': return 'bg-green-500/20 text-green-300';
            case 'Active': return 'bg-cyan-500/20 text-cyan-300';
            case 'Pending': return 'bg-amber-500/20 text-amber-300';
        }
    };

    if (isLoading) {
        return <div className="text-center p-8 text-gray-400">Loading Sponsor Grid...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Onboard Sponsor & Sync Episode</h3>
                <form onSubmit={handleSubmit} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="sponsor" className="block text-sm font-medium text-gray-400 mb-1">Sponsor</label>
                            <select id="sponsor" value={selectedSponsor} onChange={e => setSelectedSponsor(e.target.value)} className={baseInputClasses + ' mt-0 border-gray-600'}>
                                {sponsors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="episode" className="block text-sm font-medium text-gray-400 mb-1">Episode Number</label>
                            <input id="episode" value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value)} placeholder="e.g., 57" className={baseInputClasses + ' mt-0 border-gray-600'}/>
                        </div>
                    </div>
                    <button type="submit" disabled={isSyncing} className={`${baseButtonClasses} w-full`}>
                        {isSyncing ? 'Syncing...' : 'Generate Sync Link & QR'}
                    </button>
                    {error && <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-sm">{error}</div>}
                </form>

                 {syncResult && (
                    <div className="mt-4 p-4 bg-green-900/50 border border-green-700 rounded-md">
                        <h4 className="font-bold text-green-300">✅ Sync Complete for {syncResult.sponsorName}</h4>
                        <div className="flex flex-col md:flex-row items-center gap-4 mt-3">
                            <img src={syncResult.qrUrl} alt="Generated QR Code" className="w-24 h-24 rounded-md bg-white p-1" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-400">Onboarding Link:</p>
                                <a href={syncResult.link} target="_blank" rel="noopener noreferrer" className="font-mono text-cyan-300 break-all underline hover:text-white">{syncResult.link}</a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Sponsor Grid Status</h3>
                <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                             <thead className="bg-gray-800/60 text-xs text-gray-400 uppercase font-mono">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Sponsor</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Synced Episode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sponsors.map(sponsor => (
                                    <tr key={sponsor.id} className="border-b border-gray-700 hover:bg-gray-800/40">
                                        <td className="px-6 py-4 font-medium text-white">{sponsor.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(sponsor.status)}`}>{sponsor.status}</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-cyan-400">{sponsor.linkedEpisode || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
type ChartData = { label: string; value: number; color: string };
type TooltipData = { x: number; y: number; content: string } | null;

const BarChart: React.FC<{ data: ChartData[]; setTooltipData: (d: TooltipData) => void }> = ({ data, setTooltipData }) => {
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxValue = Math.max(...data.map(d => d.value), 0);
    const yScale = chartHeight / (maxValue || 1);
    const barWidth = chartWidth / (data.length || 1);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <g transform={`translate(${margin.left}, ${margin.top})`}>
                {data.map((d, i) => {
                    const barHeight = d.value * yScale;
                    const x = i * barWidth;
                    const y = chartHeight - barHeight;
                    return (
                        <g key={d.label}>
                            <rect
                                x={x + barWidth * 0.1}
                                y={y}
                                width={barWidth * 0.8}
                                height={barHeight}
                                fill={d.color}
                                className="transition-opacity duration-200"
                                onMouseMove={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setTooltipData({ x: rect.left + rect.width / 2, y: rect.top - 10, content: `${d.label}: ${d.value}` });
                                }}
                                onMouseLeave={() => setTooltipData(null)}
                            />
                            <text x={x + barWidth / 2} y={chartHeight + 20} textAnchor="middle" fill="#9ca3af" fontSize="12" className="font-mono">{d.label}</text>
                        </g>
                    );
                })}
                {/* Y-axis */}
                <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#4b5563" />
                <text x="-10" y="0" textAnchor="end" fill="#9ca3af" fontSize="12">{maxValue}</text>
                <text x="-10" y={chartHeight} textAnchor="end" fill="#9ca3af" fontSize="12">0</text>
            </g>
        </svg>
    );
};

const PieChart: React.FC<{ data: ChartData[]; setTooltipData: (d: TooltipData) => void }> = ({ data, setTooltipData }) => {
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    let startAngle = 0;

    const getArcPath = (value: number, start: number) => {
        const angle = (value / total) * 2 * Math.PI;
        const endAngle = start + angle;
        const largeArcFlag = angle > Math.PI ? 1 : 0;
        
        const startX = radius + radius * Math.cos(start - Math.PI / 2);
        const startY = radius + radius * Math.sin(start - Math.PI / 2);
        const endX = radius + radius * Math.cos(endAngle - Math.PI / 2);
        const endY = radius + radius * Math.sin(endAngle - Math.PI / 2);
        
        return `M ${radius},${radius} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
    };

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[300px] h-auto mx-auto">
            {data.map((d) => {
                const path = getArcPath(d.value, startAngle);
                startAngle += (d.value / total) * 2 * Math.PI;
                return (
                    <path
                        key={d.label}
                        d={path}
                        fill={d.color}
                        className="transition-transform duration-200 transform hover:scale-105"
                        onMouseMove={(e) => setTooltipData({ x: e.clientX, y: e.clientY - 10, content: `${d.label}: ${d.value} (${((d.value/total)*100).toFixed(1)}%)` })}
                        onMouseLeave={() => setTooltipData(null)}
                     />
                );
            })}
        </svg>
    );
};


export const StatChartUploader = () => {
    const [title, setTitle] = useState('Army Arrest Grid');
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
    const [labels, setLabels] = useState('Dhaka, Chittagong, Sylhet, Rajshahi');
    const [values, setValues] = useState('65, 42, 28, 15');
    const [error, setError] = useState('');
    const [parsedData, setParsedData] = useState<ChartData[]>([]);
    const [tooltipData, setTooltipData] = useState<TooltipData>(null);
    const [isUploaded, setIsUploaded] = useState(false);

    useEffect(() => {
        const labelArray = labels.split(',').map(l => l.trim()).filter(Boolean);
        const valueArray = values.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

        if (labelArray.length === 0 && valueArray.length === 0) {
            setError('');
            setParsedData([]);
            return;
        }

        if (labelArray.length !== valueArray.length) {
            setError('Number of labels and values must match.');
            setParsedData([]);
            return;
        }

        setError('');
        const colors = ['#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#a3e635'];
        setParsedData(labelArray.map((label, i) => ({
            label,
            value: valueArray[i],
            color: colors[i % colors.length],
        })));
    }, [labels, values]);

    const handleUpload = () => {
        setIsUploaded(true);
        setTimeout(() => setIsUploaded(false), 3000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Chart Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={`${baseInputClasses} border-gray-600`} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Chart Type</label>
                    <select value={chartType} onChange={e => setChartType(e.target.value as 'bar' | 'pie')} className={`${baseInputClasses} border-gray-600`}>
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Data Labels (comma-separated)</label>
                    <input type="text" value={labels} onChange={e => setLabels(e.target.value)} className={`${baseInputClasses} border-gray-600`} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Data Values (comma-separated)</label>
                    <input type="text" value={values} onChange={e => setValues(e.target.value)} className={`${baseInputClasses} border-gray-600`} />
                </div>
                
                <button type="button" onClick={handleUpload} disabled={!!error || parsedData.length === 0} className={`${baseButtonClasses} w-full`}>
                    Upload Chart Analysis
                </button>
                {error && <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-sm">{error}</div>}
                {isUploaded && <div className="p-3 bg-green-900/50 border border-green-700 rounded-md text-green-300 text-sm">✅ Chart '{title}' uploaded successfully.</div>}
            </div>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400 text-center">Live Preview</label>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 min-h-[350px] flex flex-col items-center justify-center relative">
                    {tooltipData && (
                         <div 
                            className="fixed p-2 text-sm bg-black/80 text-white rounded-md z-50 pointer-events-none transition-opacity"
                            style={{ top: tooltipData.y, left: tooltipData.x, transform: 'translate(-50%, -100%)' }}
                         >
                             {tooltipData.content}
                         </div>
                    )}
                    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                    {parsedData.length > 0 ? (
                        chartType === 'bar' ? (
                            <BarChart data={parsedData} setTooltipData={setTooltipData} />
                        ) : (
                            <PieChart data={parsedData} setTooltipData={setTooltipData} />
                        )
                    ) : (
                        <p className="text-gray-500">Enter data to generate a chart.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
const mockSubtitles = [
    { start: 0, end: 4, text_en: "Welcome to the GN AI Authority broadcast.", text_bn: "জিএন এআই কর্তৃপক্ষের সম্প্রচারে স্বাগতম।" },
    { start: 4.5, end: 8, text_en: "Today, we discuss the new food safety reform.", text_bn: "আজ, আমরা নতুন খাদ্য নিরাপত্তা সংস্কার নিয়ে আলোচনা করব।" },
    { start: 8.5, end: 12, text_en: "This civic action is crucial for public health.", text_bn: "এই নাগরিক পদক্ষেপ জনস্বাস্থ্যের জন্য অত্যন্ত গুরুত্বপূর্ণ।" },
    { start: 12.5, end: 16, text_en: "Our diaspora justice program ensures transparency.", text_bn: "আমাদের ডায়াস্পোরা বিচার কর্মসূচি স্বচ্ছতা নিশ্চিত করে।" },
    { start: 16.5, end: 20, text_en: "Engage with us to strengthen the reform.", text_bn: "সংস্কারকে শক্তিশালী করতে আমাদের সাথে যুক্ত হন।" },
];
const MOCK_DURATION = 20; // seconds

export const VoiceSubtitleSync = () => {
    const { activeEpisode } = useAppContext();
    const [files, setFiles] = useState<{ [key: string]: string }>({});
    const [keywords, setKeywords] = useState('reform, civic action, diaspora justice, transparency');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSynced, setIsSynced] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [episodeNumber, setEpisodeNumber] = useState('42');
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (activeEpisode) {
            setEpisodeNumber(activeEpisode.ep_number);
        }
    }, [activeEpisode]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files: inputFiles } = e.target;
        if (inputFiles && inputFiles.length > 0) {
            setFiles(prev => ({ ...prev, [name]: inputFiles[0].name }));
        }
    };
    
    const handleSync = () => {
        setIsSyncing(true);
        setCurrentTime(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        setTimeout(() => {
            setIsSyncing(false);
            setIsSynced(true);
        }, 2500);
    };

    useEffect(() => {
        if (isSynced) {
            intervalRef.current = window.setInterval(() => {
                setCurrentTime(prevTime => {
                    if (prevTime >= MOCK_DURATION) {
                        return 0; // Loop timeline
                    }
                    return prevTime + 0.1;
                });
            }, 100);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isSynced]);

    const activeSubtitle = useMemo(() => {
        return mockSubtitles.find(sub => currentTime >= sub.start && currentTime < sub.end);
    }, [currentTime]);

    const highlightKeywords = (text: string) => {
        const keywordArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
        if (keywordArray.length === 0) return text;
        const regex = new RegExp(`(${keywordArray.join('|')})`, 'gi');
        return text.split(regex).map((part, i) => 
            regex.test(part) ? <span key={i} className="text-cyan-400 font-bold">{part}</span> : part
        );
    };

    const playheadPosition = (currentTime / MOCK_DURATION) * 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Episode Number</label>
                    <input type="number" value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value)} className={`${baseInputClasses} border-gray-600`} />
                </div>
                <div className="space-y-3">
                     <label className="block text-sm font-medium text-gray-400">Asset Files</label>
                     {['audio_en', 'audio_bn', 'subtitles_srt'].map(id => (
                         <div key={id}>
                             <label htmlFor={id} className={`${baseButtonClasses} bg-gray-600 hover:bg-gray-700 text-sm w-full`}>
                                 {files[id] ? `✔️ ${files[id]}` : `Upload ${id.replace('_', ' ').toUpperCase()}`}
                             </label>
                            <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} />
                         </div>
                     ))}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Reform Emphasis Keywords (comma-separated)</label>
                    <textarea value={keywords} onChange={e => setKeywords(e.target.value)} className={`${baseInputClasses} h-24 resize-none border-gray-600`}/>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleSync} disabled={isSyncing} className={`${baseButtonClasses} flex-1`}>
                        {isSyncing ? 'Analyzing...' : 'Analyze & Sync'}
                    </button>
                    <button type="button" disabled={!isSynced} className={`${baseButtonClasses} bg-gray-600 hover:bg-gray-700 focus:ring-gray-500`}>
                        Export Synced Files
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400 text-center">Synchronization Timeline & Preview</label>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
                    <div className="flex items-center gap-3">
                        <ClockIcon className="w-5 h-5 text-cyan-400" />
                        <div className="font-mono text-cyan-300">{currentTime.toFixed(1)}s / {MOCK_DURATION.toFixed(1)}s</div>
                    </div>
                    {/* Timeline Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2.5 relative">
                        {mockSubtitles.map(sub => (
                            <div key={sub.start} className="absolute h-full bg-cyan-800/50 rounded-full" style={{ left: `${(sub.start/MOCK_DURATION)*100}%`, width: `${((sub.end - sub.start)/MOCK_DURATION)*100}%`}}></div>
                        ))}
                        <div className="absolute top-1/2 -translate-y-1/2 h-4 w-1 bg-red-500 rounded-full" style={{ left: `calc(${playheadPosition}% - 2px)` }}></div>
                    </div>

                    {/* Subtitle Preview */}
                    <div className={`transition-opacity duration-300 ${isSynced ? 'opacity-100' : 'opacity-40'}`}>
                         <div className="bg-black/40 p-4 rounded-md min-h-[120px] flex flex-col justify-center">
                            {activeSubtitle ? (
                                <>
                                    <p className="text-lg text-white font-semibold">{highlightKeywords(activeSubtitle.text_en)}</p>
                                    <p className="text-md text-gray-300 mt-1">{highlightKeywords(activeSubtitle.text_bn)}</p>
                                </>
                            ) : (
                                <p className="text-center text-gray-500">{isSynced ? '...' : 'Awaiting sync analysis'}</p>
                            )}
                         </div>
                    </div>
                </div>
                {isSynced && <div className="p-3 text-center bg-green-900/50 border border-green-700 rounded-md text-green-300 text-sm">✅ Sync analysis complete. Timeline is now active.</div>}
            </div>
        </div>
    );
};
export const DescriptionEncoder = () => {
    const { activeEpisode } = useAppContext();
    const [details, setDetails] = useState<EpisodeDetails>({
        ep_number: '42',
        title: 'FoodSafety',
        lang: 'BN',
        date: new Date().toISOString().split('T')[0],
        theme: 'Food Safety Detection and Citizen Nourishment',
        tags: ['GNLegacy', 'Cycle2', 'FoodSafety', 'DiasporaJustice']
    });
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (activeEpisode) {
            setDetails(prev => ({
                ...prev,
                ep_number: activeEpisode.ep_number,
                title: activeEpisode.title,
            }));
        }
    }, [activeEpisode]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({...prev, [name]: name === 'tags' ? value.split(',').map(t => t.trim()) : value}));
    }
    
    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setDescription('');
        const result = await generateYouTubeDescription(details);
        setDescription(result);
        setIsLoading(false);
    }, [details]);

    const handleCopy = () => {
        navigator.clipboard.writeText(description);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="ep_number" value={details.ep_number} onChange={handleInputChange} placeholder="Episode Number" className={`${baseInputClasses} border-gray-600`} />
                <input name="title" value={details.title} onChange={handleInputChange} placeholder="Title" className={`${baseInputClasses} border-gray-600`} />
                 <select name="lang" value={details.lang} onChange={handleInputChange} className={`${baseInputClasses} border-gray-600`}>
                        <option value="EN">English</option>
                        <option value="BN">Bangla</option>
                </select>
            </div>
            <textarea name="theme" value={details.theme} onChange={handleInputChange} placeholder="Theme" className={`${baseInputClasses} h-24 resize-none border-gray-600`} />
            <input name="tags" value={details.tags.join(', ')} onChange={handleInputChange} placeholder="Tags (comma-separated)" className={`${baseInputClasses} border-gray-600`} />
            
            <button onClick={handleGenerate} disabled={isLoading} className={`${baseButtonClasses} w-full`}>
                {isLoading ? 'Encoding with Gemini...' : 'Encode Description'}
            </button>
            
            {isLoading && (
                 <div className="flex justify-center items-center p-4 space-x-2">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                     <span className="text-gray-400">AI is thinking...</span>
                 </div>
            )}

            {description && (
                <div className="bg-gray-900/50 p-4 rounded-md border border-gray-700 space-y-4 relative">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-cyan-400">Generated Description:</h3>
                        <button onClick={handleCopy} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                            <CopyIcon className="w-4 h-4" />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-gray-300 text-sm bg-black/20 p-4 rounded-md">{description}</pre>
                </div>
            )}
        </div>
    );
};