import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: LucideIcon;
}

/**
 * Custom Input component with label, icon, and error state
 * Uses forwardRef for proper ref handling with react-hook-form
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon: Icon, className, id, ...props }, ref) => {
        const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
        const hasError = Boolean(error);

        return (
            <div className="flex flex-col gap-[8px]">
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-text-secondary"
                >
                    {label}
                </label>
                <div className="relative">
                    {Icon && (
                        <div className="absolute left-[14px] top-1/2 -translate-y-1/2">
                            <Icon
                                size={18}
                                className={clsx(
                                    'transition-colors duration-200',
                                    hasError ? 'text-red-primary' : 'text-text-muted'
                                )}
                            />
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={clsx(
                            'w-full h-[48px] px-[14px] py-3 bg-bg2 border rounded-[12px]',
                            'text-text-primary placeholder:text-text-muted',
                            'font-syne text-[15px] leading-normal',
                            'transition-all duration-200 ease-out',
                            'outline-none',
                            'focus:ring-2 focus:ring-cyan-primary/30',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            Icon && 'pl-[42px]',
                            hasError
                                ? 'border-red-primary/50 focus:border-red-primary'
                                : 'border-border-primary focus:border-cyan-primary',
                            className
                        )}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${inputId}-error` : undefined}
                        {...props}
                    />
                </div>
                {hasError && (
                    <p
                        id={`${inputId}-error`}
                        className="text-xs text-red-primary mt-[-4px]"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
