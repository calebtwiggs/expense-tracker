import { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { addedNotes, fixedNotes } from '@/data/patchNotes';

interface PatchNotesPopoverProps {
  currentVersion: string;
}

export function PatchNotesPopover({ currentVersion }: PatchNotesPopoverProps) {
  const [activeTab, setActiveTab] = useState<'added' | 'fixed'>('added');

  // Get notes for current version or all notes
  const currentAdded = addedNotes.find((v) => v.version === currentVersion);
  const currentFixed = fixedNotes.find((v) => v.version === currentVersion);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-sm text-muted-foreground underline hover:text-foreground transition-colors cursor-pointer">
          Patch Notes
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-hidden flex flex-col" align="start">
        <div className="font-semibold text-sm mb-3">
          Patch Notes - v{currentVersion}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3 border-b border-border">
          <button
            onClick={() => setActiveTab('added')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'added'
                ? 'text-green-500 border-b-2 border-green-500 -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            Added
          </button>
          <button
            onClick={() => setActiveTab('fixed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'fixed'
                ? 'text-blue-500 border-b-2 border-blue-500 -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            Fixed
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'added' && (
            <div className="space-y-2">
              {currentAdded && currentAdded.items.length > 0 ? (
                <ul className="space-y-1.5">
                  {currentAdded.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Plus className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No new features in this version.
                </p>
              )}
            </div>
          )}

          {activeTab === 'fixed' && (
            <div className="space-y-2">
              {currentFixed && currentFixed.items.length > 0 ? (
                <ul className="space-y-1.5">
                  {currentFixed.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Wrench className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{item.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No bug fixes in this version.
                </p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
