// Bug fixes for each version
// Add new entries at the top of the array for each version

export interface FixedItem {
  description: string;
}

export interface VersionFixed {
  version: string;
  items: FixedItem[];
}

export const fixedNotes: VersionFixed[] = [
  {
    version: '1.0.0',
    items: [
      { description: 'Fixed an issue where it wasn't displaying the correct datefrom when it was first selected.' },
    ],
  },
];
