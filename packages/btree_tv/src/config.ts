export const BUNNY_LIBRARY_ID = '621212';

export interface Video {
  id: string;
  titleEn: string;
  titleDe: string;
  descEn: string;
  descDe: string;
  langs: ('en' | 'de')[];
}

export const videos: Video[] = [
  {
    id: '6f13ee0d-2d37-4559-91aa-7cfb0635ee1d',
    titleEn: 'Introduction',
    titleDe: 'Einführung',
    descEn: 'A first look at the b.tree beekeeping app.',
    descDe: 'Ein erster Überblick über die b.tree Imkerei-App.',
    langs: ['de'],
  },
  {
    id: 'e3fa2b58-82ce-475b-a85d-b9ff1a1b2a32',
    titleEn: 'NFC',
    titleDe: 'NFC',
    descEn: 'How to use NFC tags with b.tree.',
    descDe: 'NFC-Tags mit b.tree verwenden.',
    langs: ['de'],
  },
  {
    id: 'c91c6977-5697-4d71-8980-2d9b4aa747ef',
    titleEn: 'NFC',
    titleDe: 'NFC',
    descEn: 'How to use NFC tags with b.tree.',
    descDe: 'NFC-Tags mit b.tree verwenden.',
    langs: ['en'],
  },
  {
    id: '221c860b-c9a2-47d4-bfcb-5f56f4bedd84',
    titleEn: 'Install on Android (PWA)',
    titleDe: 'Installation auf Android (PWA)',
    descEn: 'Install b.tree as a Progressive Web App on Android.',
    descDe: 'b.tree als Progressive Web App auf Android installieren.',
    langs: ['de'],
  },
  {
    id: '72b349b8-3c5f-4ace-9d40-f3f597ad808e',
    titleEn: 'Install on Android (PWA)',
    titleDe: 'Installation auf Android (PWA)',
    descEn: 'Install b.tree as a Progressive Web App on Android.',
    descDe: 'b.tree als Progressive Web App auf Android installieren.',
    langs: ['en'],
  },
  {
    id: '691ff6c2-41f7-428c-b3fb-fc550b16818f',
    titleEn: 'Install on iOS (PWA)',
    titleDe: 'Installation auf iOS (PWA)',
    descEn: 'Install b.tree as a Progressive Web App on iOS.',
    descDe: 'b.tree als Progressive Web App auf iOS installieren.',
    langs: ['de'],
  },
  {
    id: '51bb8491-46ef-4adb-aa87-4bdab4645a27',
    titleEn: 'Install on iOS (PWA)',
    titleDe: 'Installation auf iOS (PWA)',
    descEn: 'Install b.tree as a Progressive Web App on iOS.',
    descDe: 'b.tree als Progressive Web App auf iOS installieren.',
    langs: ['en'],
  },
  {
    id: '43e4b12d-4997-438b-b719-fce50d4cb19c',
    titleEn: 'QR Code',
    titleDe: 'QR Code',
    descEn: 'Using QR codes to quickly open hive records.',
    descDe: 'QR-Codes nutzen, um Bienenstockkarten schnell zu öffnen.',
    langs: ['de'],
  },
  {
    id: '85aee363-e5c9-49c1-9b92-8b68b743a7e0',
    titleEn: 'QR Code',
    titleDe: 'QR Code',
    descEn: 'Using QR codes to quickly open hive records.',
    descDe: 'QR-Codes nutzen, um Bienenstockkarten schnell zu öffnen.',
    langs: ['en'],
  },
  {
    id: '3c9a7f6b-c18f-484a-9ebe-f6eec6e9e03e',
    titleEn: 'Business & User Management',
    titleDe: 'Betriebe und Benutzer Management',
    descEn: 'Manage multiple apiaries and user accounts.',
    descDe: 'Mehrere Betriebe und Benutzerkonten verwalten.',
    langs: ['de'],
  },
  {
    id: '98b988c7-7f09-4f61-9069-53a21cb52374',
    titleEn: 'Dropbox Data Management',
    titleDe: 'Dropbox als Datenverwaltung',
    descEn: 'Use Dropbox to back up and sync your b.tree data.',
    descDe: 'Dropbox zur Datensicherung und Synchronisierung nutzen.',
    langs: ['de'],
  },
  {
    id: '6c58b27d-c1ae-4b95-b6ad-5ac6ae36e01b',
    titleEn: 'Subscribe to iCal',
    titleDe: 'iCal Abonnieren',
    descEn: 'Subscribe to b.tree reminders in your calendar app.',
    descDe: 'b.tree-Erinnerungen im Kalender abonnieren.',
    langs: ['de'],
  },
  {
    id: '328a5549-7c5d-4acf-902c-4c4d7a034ff8',
    titleEn: 'Breeding Method & Breeding Series',
    titleDe: 'Zuchtmethode und Zuchtserie',
    descEn: 'Track queen breeding methods and series in b.tree.',
    descDe: 'Zuchtmethoden und Zuchtserien in b.tree erfassen.',
    langs: ['de'],
  },
];

export function videosForLang(lang: 'en' | 'de'): Video[] {
  return videos.filter((v) => v.langs.includes(lang));
}

/**
 * Returns all videos for the EN page:
 * - EN videos come first, marked deOnly: false
 * - DE-only videos follow (no EN version exists), marked deOnly: true
 * Duplicate topics (same title, both EN+DE) are deduplicated — EN wins.
 */
export function videosForEnPage(): (Video & { deOnly: boolean })[] {
  const enVideos = videos.filter((v) => v.langs.includes('en'));
  const enTitles = new Set(enVideos.map((v) => v.titleEn));
  const deOnlyVideos = videos.filter(
    (v) => v.langs.includes('de') && !v.langs.includes('en') && !enTitles.has(v.titleEn)
  );
  return [
    ...enVideos.map((v) => ({ ...v, deOnly: false })),
    ...deOnlyVideos.map((v) => ({ ...v, deOnly: true })),
  ];
}
