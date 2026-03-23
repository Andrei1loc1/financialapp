import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Wallet, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input, Button, Card } from './ui';
import { useOnboarding } from '../hooks/useOnboarding';
import { formFields } from '../schemas/onboarding';

/**
 * Progress indicator component
 */
const ProgressIndicator: React.FC<{
    currentStep: number;
    totalSteps: number;
}> = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="flex items-center gap-3 mb-6">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index < currentStep
                            ? 'bg-cyan-primary'
                            : index === currentStep - 1
                                ? 'bg-cyan-primary/50'
                                : 'bg-border-primary'
                            }`}
                    />
                ))}
            </div>
            <span className="text-xs text-text-muted font-mono">
                Pasul {currentStep} din {totalSteps}
            </span>
        </div>
    );
};

/**
 * Success state component
 */
const SuccessState: React.FC<{ name: string }> = ({ name }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center text-center py-8"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-green-primary/10 flex items-center justify-center mb-6"
            >
                <CheckCircle2 size={40} className="text-green-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
                Bun venit, {name.split(' ')[0]}! 🎉
            </h2>
            <p className="text-text-secondary max-w-[280px]">
                Contul tău a fost creat cu succes. Ești gata să începi gestionarea
                finanțelor tale!
            </p>
        </motion.div>
    );
};

/**
 * Main Onboarding Page component
 * Implements a mobile-first design with smooth animations
 */
const OnboardingPage: React.FC = () => {
    const {
        register,
        handleSubmit,
        errors,
        isValid,
        isSubmitting,
        isSubmitted,
        error,
        watchedValues,
    } = useOnboarding();

    const [mounted, setMounted] = useState(false);

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    // Show success state after submission
    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[380px]"
                >
                    <Card variant="elevated" padding="lg">
                        <SuccessState name={watchedValues.fullName} />
                        <Button
                            fullWidth
                            onClick={() => {
                                // Navigate to dashboard - this would be handled by parent
                                window.location.reload();
                            }}
                            className="mt-6"
                        >
                            Începe acum
                            <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Background effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-primary/5 blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-primary/5 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-[380px] relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-[16px] bg-cyan-primary/10 mb-5"
                    >
                        <Sparkles size={28} className="text-cyan-primary" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-text-primary mb-2"
                    >
                        Bun venit în Financier AI
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-text-secondary text-[15px]"
                    >
                        Spune-ne puțin despre tine pentru a începe
                    </motion.p>
                </div>

                {/* Progress indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <ProgressIndicator currentStep={1} totalSteps={1} />
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                >
                    <Card variant="default" padding="lg">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Full Name Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <Input
                                    {...register('fullName')}
                                    label={formFields[0].label}
                                    placeholder={formFields[0].placeholder}
                                    type={formFields[0].type}
                                    autoComplete={formFields[0].autoComplete}
                                    autoFocus={formFields[0].autoFocus}
                                    icon={User}
                                    error={errors.fullName?.message}
                                />
                            </motion.div>

                            {/* Income Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <Input
                                    {...register('income')}
                                    label={formFields[1].label}
                                    placeholder={formFields[1].placeholder}
                                    type={formFields[1].type}
                                    autoComplete={formFields[1].autoComplete}
                                    icon={Wallet}
                                    error={errors.income?.message}
                                />
                            </motion.div>

                            {/* Error message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="alert-card warn"
                                    >
                                        <div className="alert-icon">⚠</div>
                                        <p className="text-sm text-amber-primary">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="pt-2"
                            >
                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={!isValid}
                                    isLoading={isSubmitting}
                                >
                                    Continuă
                                    <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </motion.div>
                        </form>
                    </Card>
                </motion.div>

                {/* Privacy note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-xs text-text-muted mt-6"
                >
                    Datele tale sunt securizate și nu vor fi partajate
                </motion.p>
            </motion.div>
        </div>
    );
};

export default OnboardingPage;
