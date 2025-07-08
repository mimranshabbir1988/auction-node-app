import cron from 'node-cron';
import { checkBids } from './bidChecker';

// Schedule checkBids to run every minute
cron.schedule('* * * * *', async () => {
  await checkBids();
});
