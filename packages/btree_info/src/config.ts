export const SITE = {
  title: 'b.tree',
  description:
    'Professional beekeeping software for digital hive records, apiary management, queen rearing, treatments, harvests, statistics, and AI-assisted data entry.',
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
    { text: 'Introduction', link: '' },
    {
      text: 'Features',
      link: 'features/',
      children: [
        { text: 'Digital Hive Records', link: 'features/hive-records/' },
        { text: 'Organic Beekeeping', link: 'features/organic-beekeeping/' },
      ],
    },
    { text: 'Price', link: 'price/' },
    { text: 'FAQs', link: 'doc-faqs/' },
    { text: 'First Steps', link: 'doc-first-steps/' },
    { text: 'API', link: 'doc-api/' },
    { text: 'Agent API', link: 'doc-agent/' },
    { text: 'Other', link: 'doc-other/' },
    { text: 'Updates', link: 'updates/' },

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
    { text: 'Einführung', link: 'de/' },
    {
      text: 'Funktionen',
      link: 'de/features/',
      children: [
        { text: 'Digitale Stockkarte', link: 'de/features/hive-records/' },
        { text: 'Bio-Imkerei', link: 'de/features/organic-beekeeping/' },
      ],
    },
    { text: 'Preis', link: 'de/price/' },
    { text: 'FAQs', link: 'de/doc-faqs/' },
    { text: 'Erste Schritte', link: 'de/doc-first-steps/' },
    { text: 'API', link: 'de/doc-api/' },
    { text: 'Agent API', link: 'de/doc-agent/' },
    { text: 'Sonstiges', link: 'de/doc-other/' },
    { text: 'Neuerungen', link: 'de/updates/' },

    { text: 'Über uns', header: true },
    { text: 'Imkerei', link: 'de/beekeeping/' },
    { text: 'Curriculum Vitae', link: 'https://www.oberreiter.or.at/hannes' },

    { text: 'Rechtliches', header: true },
    { text: 'Impressum', link: 'de/imprint/' },
    { text: 'Datenschutz', link: 'de/data-privacy/' },
  ],
};
