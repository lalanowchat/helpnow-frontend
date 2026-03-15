import axios from "axios";

const DEEPL_API_KEY = `${import.meta.env.DEEPL_API_KEY}`; // Replace with your DeepL API key
const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";

/**
 * Translates text using DeepL API.
 * @param {string} text - The text to translate.
 * @param {string} targetLanguage - The target language code (e.g., "ES" for Spanish).
 * @returns {Promise<string>} - The translated text.
 */
export const translateText = async (text, targetLanguage) => {
  try {
    const response = await axios.post(
      DEEPL_API_URL,
      {
        text: [text],
        target_lang: targetLanguage,
      },
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Return the translated text
    return response.data.translations[0].text;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Return the original text if translation fails
  }
};