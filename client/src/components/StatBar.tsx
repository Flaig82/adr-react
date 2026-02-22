interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color?: string;
  showNumbers?: boolean;
}

export function StatBar({ label, current, max, color = 'bg-adr-green', showNumbers = true }: StatBarProps) {
  const percent = max > 0 ? Math.min(100, (current / max) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300 font-medium">{label}</span>
        {showNumbers && (
          <span className="text-gray-400">
            {current} / {max}
          </span>
        )}
      </div>
      <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
