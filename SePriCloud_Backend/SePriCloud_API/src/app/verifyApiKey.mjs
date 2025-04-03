import { getAllApiKeys } from './db/index.mjs';

export const verifyApiKey = async (sentApiKey) => {
    if (sentApiKey && typeof sentApiKey  === "string" && sentApiKey !== '') {
        const apiKeyArray = await getAllApiKeys();

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
