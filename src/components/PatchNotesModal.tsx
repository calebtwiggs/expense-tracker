import { useState } from 'react';
import { Plus, Wrench, X } from 'lucide-react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { addedNotes, fixedNotes } from '@/data/patchNotes';
import { cn } from '@/lib/utils';

interface PatchNotesModalProps {
  currentVersion: string;
}

// Combine all versions from both added and fixed notes
function getAllVersions(): string[] {
  const versions = new Set<string>();
  addedNotes.forEach((v) => versions.add(v.version));
  fixedNotes.forEach((v) => versions.add(v.version));
  // Sort versions in descending order (newest first)
  return Array.from(versions).sort((a, b) => {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      if (numB !== numA) return numB - numA;
    }
    return 0;
  });
}

export function PatchNotesModal({ currentVersion }: PatchNotesModalProps) {
  const [open, setOpen] = useState(false);
  const allVersions = getAllVersions();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-muted-foreground underline hover:text-foreground transition-colors cursor-pointer">
          Patch Notes
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-[90vw] max-w-3xl h-[80vh] translate-x-[-50%] translate-y-[-50%] border bg-background shadow-lg duration-200 rounded-xl overflow-hidden flex flex-col',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
          )}
        >
          {/* Custom circular close button */}
          <DialogClose className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center opacity-70 hover:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {/* Header */}
          <div className="p-6 pb-4 border-b flex-shrink-0">
            <DialogPrimitive.Title className="text-xl font-semibold">
              Patch Notes
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                Current: v{currentVersion}
              </span>
            </DialogPrimitive.Title>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {allVersions.map((version) => {
              const addedForVersion = addedNotes.find(
                (v) => v.version === version
              );
              const fixedForVersion = fixedNotes.find(
                (v) => v.version === version
              );
              const hasAdded =
                addedForVersion && addedForVersion.items.length > 0;
              const hasFixed =
                fixedForVersion && fixedForVersion.items.length > 0;

              if (!hasAdded && !hasFixed) return null;

              return (
                <div key={version} className="space-y-4">
                  {/* Version header */}
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">Version {version}</h3>
                    {version === currentVersion && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Added section */}
                    {hasAdded && (
                      <div className="space-y-3 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Plus className="h-3.5 w-3.5 text-green-500" />
                          </div>
                          <h4 className="font-medium text-green-500">Added</h4>
                        </div>
                        <ul className="space-y-2">
                          {addedForVersion.items.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="text-green-500 mt-1">•</span>
                              <span>{item.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Fixed section */}
                    {hasFixed && (
                      <div className="space-y-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Wrench className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <h4 className="font-medium text-blue-500">Fixed</h4>
                        </div>
                        <ul className="space-y-2">
                          {fixedForVersion.items.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{item.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Divider between versions */}
                  {version !== allVersions[allVersions.length - 1] && (
                    <div className="border-b border-border pt-4" />
                  )}
                </div>
              );
            })}

            {allVersions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No patch notes available.
              </p>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
