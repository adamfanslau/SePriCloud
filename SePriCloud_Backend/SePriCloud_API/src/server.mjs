import { createServer } from 'http'; // https ?
import { readFileSync } from 'fs';
import path, {dirname} from 'path';
import { fileURLToPath } from 'url';
import app from './app/api.mjs';
import dotenv from 'dotenv';
dotenv.config();

const PORT = 3001;
const APP_RUNTIME_MODE = process.env.APP_RUNTIME_MODE || '';

// currently considering reverse proxy to handle the https encryption (nginx) 🤔
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const options = {
//     key: readFileSync(path.join(__dirname, 'certs', 'localhost-key.pem')),
//     cert: readFileSync(path.join(__dirname, 'certs', 'localhost.pem')),
// };

export const server = createServer(app); // (options, app)

if (APP_RUNTIME_MODE !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}
