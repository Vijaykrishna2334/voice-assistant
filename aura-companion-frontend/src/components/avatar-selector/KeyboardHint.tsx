import { Keyboard } from 'lucide-react';

export function KeyboardHint() {
  return (
    <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm">
      <Keyboard className="w-4 h-4" />
      <span>← → Navigate</span>
      <span className="mx-2">•</span>
      <span>Enter Select</span>
    </div>
  );
}
