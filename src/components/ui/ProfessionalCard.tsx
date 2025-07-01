import Image from 'next/image';
import Button from './Button';
import Badge from './Badge';

interface ProfessionalCardProps {
  professional: {
    id: string;
    name: string;
    title: string;
    location: string;
    avatar: string;
    specializations: string[];
    rating: number;
    reviewCount: number;
    experience: string;
    verified: boolean;
    premium?: boolean;
  };
  onViewProfile?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export default function ProfessionalCard({ 
  professional, 
  onViewProfile, 
  onToggleFavorite,
  isFavorited = false 
}: ProfessionalCardProps) {
  const { 
    id, 
    name, 
    title, 
    location, 
    avatar, 
    specializations, 
    rating, 
    reviewCount, 
    experience, 
    verified,
    premium 
  } = professional;

  // Generate star rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    
    return stars.join('');
  };

  return (
    <div className={`card hover:shadow-card-hover transition-all duration-300 ${premium ? 'card-premium' : ''}`}>
      <div className="p-6">
        {/* Header with avatar and basic info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Image 
              className="w-12 h-12 rounded-full object-cover" 
              src={avatar} 
              alt={`${name}'s profile`}
              width={48}
              height={48}
            />
            {/* Fallback avatar with initials - would need custom error handling for Next.js Image */}
            
            {/* Verification badge */}
            {verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-heading-3 truncate font-semibold text-neutral-900">
              {name}
            </h3>
            <p className="text-body-small text-neutral-600">
              {title} • {location}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {verified && (
              <Badge variant="verified">
                Verified
              </Badge>
            )}
            {premium && (
              <Badge variant="premium">
                Premium
              </Badge>
            )}
          </div>
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-2 mb-4">
          {specializations.slice(0, 3).map((spec, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
            >
              {spec}
            </span>
          ))}
          {specializations.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
              +{specializations.length - 3} more
            </span>
          )}
        </div>

        {/* Rating and experience */}
        <div className="flex items-center justify-between text-body-small text-neutral-600 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-accent-400" aria-label={`${rating} out of 5 stars`}>
              {renderStars(rating)}
            </span>
            <span className="font-medium text-neutral-700">
              {rating.toFixed(1)}
            </span>
            <span>({reviewCount} reviews)</span>
          </div>
          <span className="font-medium">
            {experience} experience
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            className="flex-1"
            onClick={() => onViewProfile?.(id)}
            aria-label={`View ${name}'s profile`}
          >
            View Profile
          </Button>
          <Button 
            variant="ghost" 
            className="px-3"
            onClick={() => onToggleFavorite?.(id)}
            aria-label={isFavorited ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
          >
            <svg 
              className={`w-4 h-4 ${isFavorited ? 'text-error fill-current' : 'text-neutral-400'}`} 
              fill={isFavorited ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </Button>
        </div>

        {/* Premium feature preview */}
        {premium && (
          <div className="mt-4 pt-4 border-t border-accent-200">
            <div className="flex items-center gap-2 text-body-small text-accent-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Direct contact available • Portfolio access • Priority response</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 