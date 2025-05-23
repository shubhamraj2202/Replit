interface IOSStatusBarProps {
  time?: string;
}

export function IOSStatusBar({ time = "9:41" }: IOSStatusBarProps) {
  return (
    <div className="h-11 bg-white flex items-center justify-between px-6 pt-2">
      <div className="text-sm font-semibold">{time}</div>
      <div className="flex items-center gap-1">
        <svg className="w-4 h-3" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" />
          <rect x="4" y="6" width="3" height="6" />
          <rect x="8" y="4" width="3" height="8" />
          <rect x="12" y="2" width="3" height="10" />
        </svg>
        <svg className="w-4 h-3" viewBox="0 0 16 11" fill="currentColor">
          <path d="M1 8.5C1 6.567 2.567 5 4.5 5S8 6.567 8 8.5 6.433 12 4.5 12 1 10.433 1 8.5z" />
          <path d="M8.5 5.5C8.5 4.119 9.619 3 11 3s2.5 1.119 2.5 2.5S12.381 8 11 8s-2.5-1.119-2.5-2.5z" />
        </svg>
        <svg className="w-6 h-3" viewBox="0 0 24 13" fill="currentColor">
          <rect x="1" y="1" width="20" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="22" y="4" width="1" height="5" rx="0.5" />
          <rect x="2" y="2" width="18" height="9" rx="1" />
        </svg>
      </div>
    </div>
  );
}
