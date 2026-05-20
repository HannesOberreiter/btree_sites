export const SITE = {
  title: 'b.tree',
  description: 'Professional beekeeping software for digital hive records, apiary management, queen rearing, treatments, harvests, statistics, and AI-assisted data entry.',
  defaultLanguage: 'de_DE',
};

export const OPEN_GRAPH = {
  facebook: 'https://www.facebook.com/btree.at',
  image: {
    src: 'https://www.btree.at/og-facebook.png',
    alt: 'b.tree Professional Beekeeping Database serving since 2014.',
  },
};

export const KNOWN_LANGUAGES = {
  English: 'en',
  Deutsch: 'de',
};

export const SIDEBAR = {
  en: [
    { text: '', header: true },
    { text: 'Beekeeping Application', header: true },
    { text: '🐝 Login', link: 'https://app.btree.at' },
    { text: 'Introduction', link: 'introduction/' },
    { text: 'Features', link: 'features/' },
    { text: 'Price', link: 'price/' },
    { text: 'FAQs', link: 'doc-faqs/' },
    { text: 'First Steps', link: 'doc-first-steps/' },
    { text: 'API', link: 'doc-api/' },
    { text: 'Agent API', link: 'doc-agent/' },
    { text: 'Other', link: 'doc-other/' },
    { text: 'Updates', link: 'updates/' },
    { text: 'External Links', link: 'links/' },

    { text: 'About Us', header: true },
    { text: 'Beekeeping', link: 'beekeeping/' },
    { text: 'Curriculum Vitae', link: 'https://www.oberreiter.or.at/hannes' },

    { text: 'Notice', header: true },
    { text: 'Imprint', link: 'imprint/' },
    { text: 'Data Privacy', link: 'data-privacy/' },
  ],
  de: [
    { text: '', header: true },
    { text: 'Imkerei Software', header: true },
    { text: '🐝 Login', link: 'https://app.btree.at' },
    { text: 'Einführung', link: 'de/introduction/' },
    { text: 'Funktionen', link: 'de/features/' },
    { text: 'Preis', link: 'de/price/' },
    { text: 'FAQs', link: 'de/doc-faqs/' },
    { text: 'Ersten Schritte', link: 'de/doc-first-steps/' },
    { text: 'API', link: 'de/doc-api/' },
    { text: 'Agent API', link: 'de/doc-agent/' },
    { text: 'Sonstiges', link: 'de/doc-other/' },
    { text: 'Updates', link: 'de/updates/' },
    { text: 'Externe Links', link: 'de/links/' },

    { text: 'Über uns', header: true },
    { text: 'Imkerei', link: 'de/beekeeping/' },
    { text: 'Curriculum Vitae', link: 'https://www.oberreiter.or.at/hannes' },

    { text: 'Rechtliches', header: true },
    { text: 'Impressum', link: 'de/imprint/' },
    { text: 'Datenschutz', link: 'de/data-privacy/' },
  ],
};
