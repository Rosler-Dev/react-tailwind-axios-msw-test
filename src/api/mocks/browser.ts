import { setupWorker } from 'msw/browser';
import tourHandlers from './handlers/tourHandlers';
 
const worker = setupWorker(...tourHandlers);

// if (process.env.NODE_ENV === "development") {
  worker.start();
// }
