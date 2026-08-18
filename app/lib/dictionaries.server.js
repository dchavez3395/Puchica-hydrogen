import {DICTIONARIES} from './dictionaries.js';
import {LANGUAGE_KEYS} from './i18n.js';

const MERGED_DICTIONARIES = Object.freeze(
  Object.fromEntries(
    Object.entries(DICTIONARIES).map(([key, dictionary]) => [
      key,
      Object.freeze({...DICTIONARIES.en, ...dictionary}),
    ]),
  ),
);

export function getRequestDictionary(language = 'EN') {
  const key = LANGUAGE_KEYS[language] || 'en';
  return MERGED_DICTIONARIES[key] || MERGED_DICTIONARIES.en;
}
