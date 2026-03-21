import { I18n } from 'i18n-js';

import en from './en/en.json';
import hi from './hi/hi.json';

const i18n = new I18n({ en, hi });
i18n.defaultLocale = 'en';
i18n.translations = { en, hi };
export default i18n;
