export interface Sponsor {
  id: string;
  name: string;
  status: 'Pending' | 'Active' | 'Onboarded';
  linkedEpisode: string | null;
}

// Mock database of sponsors
let mockSponsors: Sponsor[] = [
  { id: 'sp_01', name: 'FutureScape Analytics', status: 'Active', linkedEpisode: 'Ep42' },
  { id: 'sp_02', name: 'Diaspora Connect Initiative', status: 'Pending', linkedEpisode: null },
  { id: 'sp_03', name: 'Civic Ledger Foundation', status: 'Onboarded', linkedEpisode: 'Ep51' },
  { id: 'sp_04', name: 'NourishNet Systems', status: 'Pending', linkedEpisode: null },
  { id: 'sp_05', name: 'Veritas Chain', status: 'Active', linkedEpisode: null },
];

// Simulates fetching the list of sponsors from a database
export const getSponsors = async (): Promise<Sponsor[]> => {
  console.log("Fetching sponsors from the grid...");
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  return [...mockSponsors];
};

// Simulates linking a sponsor to an episode and updating their status
export const linkSponsorToEpisode = async (sponsorId: string, episodeNumber: string): Promise<Sponsor[]> => {
  console.log(`Syncing sponsor ${sponsorId} with Episode ${episodeNumber}...`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call delay

  // Simulate potential failure
  if (episodeNumber === '0') {
      throw new Error("Invalid Episode Number provided for sync.");
  }
  
  mockSponsors = mockSponsors.map(sponsor => {
      if (sponsor.id === sponsorId) {
          return {
              ...sponsor,
              status: 'Onboarded',
              linkedEpisode: `Ep${episodeNumber}`,
          };
      }
      return sponsor;
  });

  console.log("Sync successful. Updated sponsor grid:", mockSponsors);
  return [...mockSponsors];
};
