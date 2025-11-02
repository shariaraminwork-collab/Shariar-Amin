export interface BroadcastPayload {
  episodeNumber: string;
  message: string;
  channels: string[];
}

export interface BroadcastResult {
  channel: string;
  status: 'success' | 'failed';
  message: string;
}

// Simulates sending a message to a specific channel with a delay
const sendToChannel = (channel: string): Promise<BroadcastResult> => {
  return new Promise(resolve => {
    const delay = 1000 + Math.random() * 1500; // Random delay between 1s and 2.5s
    setTimeout(() => {
      // Simulate a potential failure for demonstration
      if (channel === 'Email' && Math.random() > 0.8) {
        resolve({ channel, status: 'failed', message: 'SMTP server connection timed out.' });
      } else {
        resolve({ channel, status: 'success', message: `Broadcast to ${channel} successful.` });
      }
    }, delay);
  });
};

export const diasporaBroadcast = async (
  payload: BroadcastPayload,
  onProgress: (result: BroadcastResult) => void
): Promise<void> => {
  console.log("Initiating diaspora broadcast for:", payload);

  // We process channels one by one to show a clear sequence in the log
  for (const channel of payload.channels) {
      const result = await sendToChannel(channel);
      onProgress(result);
  }
  
  console.log("Diaspora broadcast sequence complete.");
};
