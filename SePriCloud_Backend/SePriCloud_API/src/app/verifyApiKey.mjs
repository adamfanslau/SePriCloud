import db from './db/index.mjs';

const verifyApiKey = async (sentApiKey) => {
    if (sentApiKey && typeof sentApiKey  === "string" && sentApiKey !== '') {
        const apiKeyArray = await db.getAllApiKeys();

        if (apiKeyArray && apiKeyArray.length > 0) {
            for (const apiKey of apiKeyArray) {
                if (apiKey.api_key == sentApiKey) {
                    return apiKey;
                }
            }
        }
    }

    return null;
};

export default {
    verifyApiKey
};
