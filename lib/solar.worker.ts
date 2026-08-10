import { simulatePvSystemGeneration } from './solar-physics';

self.onmessage = (event: MessageEvent) => {
  try {
    const { lat, lng, config } = event.data;
    const result = simulatePvSystemGeneration(lat, lng, config);
    self.postMessage({ success: true, result });
  } catch (error: any) {
    self.postMessage({ success: false, error: error?.message || 'Physics simulation failed' });
  }
};
