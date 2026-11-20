import { HiStar } from 'react-icons/hi';
import { formatRating } from '../../lib/format';

export default function Stars({ value, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold text-text ${className}`} title="Avaliação">
      <HiStar className="h-4 w-4 text-primary-500" aria-hidden="true" />
      {formatRating(value)}
    </span>
  );
}
