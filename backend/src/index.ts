import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

export const app = createApp();

const port = Number(process.env.PORT) || 3010;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running at http://localhost:${port}`);
  });
}
