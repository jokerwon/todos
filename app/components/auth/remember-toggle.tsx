'use client';

interface RememberToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function RememberToggle({ checked, onChange }: RememberToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        checked={checked}
        data-testid="remember-toggle"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>记住我</span>
    </label>
  );
}
