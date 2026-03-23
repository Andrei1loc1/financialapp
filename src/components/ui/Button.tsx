import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

/**
 * Custom Button component with loading state and variants
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    children,
    className,
    disabled,
    ...props
}) => {
    const baseStyles =
        'inline-flex items-center justify-center font-syne font-semibold rounded-[12px] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg disabled:cursor-not-allowed';

    const variants = {
        primary:
            'bg-cyan-primary text-bg hover:bg-cyan-light focus:ring-cyan-primary/50 active:scale-[0.98]',
        secondary:
            'bg-card2 text-text-primary border border-border-primary hover:bg-bg3 hover:border-cyan-primary/30 focus:ring-cyan-primary/30',
        ghost:
            'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg2 focus:ring-cyan-primary/20',
    };

    const sizes = {
        sm: 'h-[36px] px-[14px] text-sm',
        md: 'h-[48px] px-[20px] text-[15px]',
        lg: 'h-[56px] px-[28px] text-base',
    };

    return (
        <button
            className={clsx(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                isLoading && 'pointer-events-none',
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2
                        size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
                        className="animate-spin mr-2"
                    />
                    <span>Se procesează...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};
