// Features and additions for each version
// Add new entries at the top of the array for each version

export interface AddedItem {
  description: string;
}

export interface VersionAdded {
  version: string;
  items: AddedItem[];
}

export const addedNotes: VersionAdded[] = [
  {
    version: '1.0.0',
    items: [
      { description: 'Initial release of expense tracker' },
    ],
  },
];
