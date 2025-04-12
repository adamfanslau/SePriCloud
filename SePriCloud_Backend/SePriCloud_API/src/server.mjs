import { createServer } from 'http';
import app from './app/api.mjs';
import dotenv from 'dotenv';
dotenv.config();

const PORT = 3001;
const APP_RUNTIME_MODE = process.env.APP_RUNTIME_MODE || '';

export const server = createServer(app);

if (APP_RUNTIME_MODE !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}
