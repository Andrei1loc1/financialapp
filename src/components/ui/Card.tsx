import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card component with variants and custom styling
 * Matches the existing liquid-card design from the project
 */
export const Card: React.FC<CardProps> = ({
    children,
    className,
    variant = 'default',
    padding = 'md',
}) => {
    const variants = {
        default: 'bg-card border border-border-primary',
        elevated: 'bg-card2 border border-border-secondary shadow-lg',
        outlined: 'bg-transparent border border-border-secondary',
    };

    const paddings = {
        none: '',
        sm: 'p-[12px]',
        md: 'p-[18px]',
        lg: 'p-[24px]',
    };

    return (
        <div
            className={clsx(
                'relative overflow-hidden rounded-[20px]',
                variants[variant],
                paddings[padding],
                className
            )}
        >
            {/* Subtle gradient overlay for depth */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse at 60% 40%, rgba(56, 189, 248, 0.05) 0%, transparent 60%)',
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
};
