import { setupWorker } from 'msw/browser';
import tourHandlers from './handlers/tourHandlers';
 
export const worker = setupWorker(...tourHandlers);
