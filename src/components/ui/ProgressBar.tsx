interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({ 
  value, 
  className = '', 
  showLabel = false, 
  label 
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`${className}`.trim()}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-body-small text-muted">
            {label || 'Progress'}
          </span>
          <span className="text-body-small text-muted">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
      <div className="progress">
        <div 
          className="progress-bar" 
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
} 