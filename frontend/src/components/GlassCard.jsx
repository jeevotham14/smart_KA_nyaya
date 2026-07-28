import { forwardRef } from 'react';

const GlassCard = forwardRef(function GlassCard(
  { children, className = '', hover = true, gradient = false, padding = true, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`glass-card ${
        hover ? '' : '!transform-none hover:!shadow-[var(--glass-shadow)]'
      } ${gradient ? 'border-gradient' : ''} ${padding ? 'p-6 sm:p-8' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default GlassCard;
