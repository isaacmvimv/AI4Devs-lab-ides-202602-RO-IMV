import dotenv from 'dotenv';
import { createApp } from './app';
import { prisma } from './prismaClient';

dotenv.config();

export const app = createApp();

const port = Number(process.env.PORT || 3010);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export { prisma };
export default prisma;
