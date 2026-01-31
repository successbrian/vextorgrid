import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[#1a1a1a] border border-[#333] p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}
