interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'premium' | 'verified';
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'success', 
  className = '' 
}: BadgeProps) {
  const baseClass = 'badge';
  const variantClass = `badge-${variant}`;

  return (
    <span className={`${baseClass} ${variantClass} ${className}`.trim()}>
      {children}
    </span>
  );
} 