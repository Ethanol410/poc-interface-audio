/**
 * Spinner — indicateur de chargement réutilisable.
 * size: 'sm' | 'md' | 'lg'
 * color: couleur Tailwind text-* (appliquée sur le bord)
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

const SIZE = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
};

const Spinner = ({ size = 'md', color = 'border-forensics-cyan', label }: SpinnerProps) => (
  <span className="inline-flex items-center gap-2">
    <span
      className={`${SIZE[size]} ${color} border-t-transparent rounded-full animate-spin inline-block`}
      role="status"
      aria-label={label ?? 'Chargement'}
    />
    {label && (
      <span className="font-mono text-xs text-gray-400 animate-pulse">{label}</span>
    )}
  </span>
);

export default Spinner;
