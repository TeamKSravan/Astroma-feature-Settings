import { I18n } from 'i18n-js';

import en from './en/en.json';
import nl from './nl/nl.json';
import hi from './hi/hi.json';

const i18n = new I18n({ en, nl, hi });
i18n.defaultLocale = 'en';
i18n.translations = { en, nl, hi };
export default i18n;
