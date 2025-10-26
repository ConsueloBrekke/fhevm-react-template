import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export default function Card({
  title,
  subtitle,
  children,
  className = '',
  footer
}: CardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
      {footer && (
        <div className="card-footer mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}
