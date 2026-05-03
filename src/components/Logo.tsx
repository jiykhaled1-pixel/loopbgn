import { useState } from 'react';
import { Dice5 } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', iconOnly = false, size = 'md' }: LogoProps) {
  const [hasError, setHasError] = useState(false);
  
  // Using a stable URL for the orange dice logo
  const logoUrl = "https://storage.googleapis.com/context_proxied_images/cb31599371eecbc759eb5835ea55f114c0293674fe4090fd026938d976fc42e4";
  
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${iconSizes[size]} flex-shrink-0 flex items-center justify-center relative`}>
        {!hasError ? (
          <img 
            src={logoUrl} 
            alt="loopbgn" 
            className="w-full h-full object-contain"
            onError={() => setHasError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary shadow-lg shadow-brand-primary/20">
            <Dice5 className="w-2/3 h-2/3" />
          </div>
        )}
      </div>
      {!iconOnly && (
        <span className={`font-black text-brand-text tracking-tighter ${textSizes[size]}`}>
          loop<span className="text-brand-primary">bgn</span>
        </span>
      )}
    </div>
  );
}
