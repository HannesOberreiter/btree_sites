export const SITE = {
  title: 'b.tree',
  description: 'Professional Beekeeping Database',
  defaultLanguage: 'de_DE',
};

export const OPEN_GRAPH = {
  image: {
    src: 'https://www.btree.at/og-facebook.png',
    srcTwitter: 'https://www.btree.at/og-twitter.png',
    alt: 'b.tree Professional Beekeeping Database serving since 2014.',
  },
  twitter: 'btree_hannes',
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
    { text: 'Price', link: 'price/' },
    { text: 'FAQs', link: 'doc-faqs/' },
    { text: 'First Steps', link: 'doc-first-steps/' },
    { text: 'API', link: 'doc-api/' },
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
    { text: 'Preis', link: 'de/price/' },
    { text: 'FAQs', link: 'de/doc-faqs/' },
    { text: 'Ersten Schritte', link: 'de/doc-first-steps/' },
    { text: 'API', link: 'de/doc-api/' },
    { text: 'Sonstiges', link: 'de/doc-other/' },
    { text: 'Updates (en)', link: 'de/updates/' },
    { text: 'Externe Links', link: 'de/links/' },

    { text: 'Über uns', header: true },
    { text: 'Imkerei', link: 'de/beekeeping/' },
    { text: 'Curriculum Vitae', link: 'https://www.oberreiter.or.at/hannes' },

    { text: 'Rechtliches', header: true },
    { text: 'Impressum', link: 'de/imprint/' },
    { text: 'Datenschutz', link: 'de/data-privacy/' },
  ],
};
