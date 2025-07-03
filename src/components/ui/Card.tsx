interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'premium';
  hover?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true 
}: CardProps) {
  const baseClass = 'card';
  const variantClass = variant === 'premium' ? 'card-premium' : '';
  const hoverClass = hover ? 'hover-lift' : '';

  return (
    <div className={`${baseClass} ${variantClass} ${hoverClass} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`card-header ${className}`.trim()}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`card-content ${className}`.trim()}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`card-footer ${className}`.trim()}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold ${className}`.trim()}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-slate-600 ${className}`.trim()}>
      {children}
    </p>
  );
}

export default Card; 