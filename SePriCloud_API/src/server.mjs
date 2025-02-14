import { createServer } from 'http'; // https ?
import { readFileSync } from 'fs';
import path, {dirname} from 'path';
import { fileURLToPath } from 'url';
import app from './app/api.mjs';

const PORT = 3001;

// currently considering reverse proxy to handle the https encryption
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const options = {
//     key: readFileSync(path.join(__dirname, 'certs', 'localhost-key.pem')),
//     cert: readFileSync(path.join(__dirname, 'certs', 'localhost.pem')),
// };

const server = createServer(app); // (options, app)

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
