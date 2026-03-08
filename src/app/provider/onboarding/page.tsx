"use client";

import { useState } from "react";
import {
    CheckCircle,
    Building2,
    Clock,
    Users,
    ArrowRight,
    Plus,
    Sparkles,
    ChevronRight,
    GalleryVerticalEnd,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

const STEPS = [
    { id: 1, label: "Welcome" },
    { id: 2, label: "How it works" },
    { id: 3, label: "Get started" },
];

const HOW_IT_WORKS = [
    {
        step: "01",
        icon: Plus,
        title: "Create a listing",
        description:
            "Add your business details — name, category, location, hours, and photos. It only takes a few minutes.",
        accent: "text-indigo-300",
        bg: "bg-indigo-500/10 border-indigo-400/20",
    },
    {
        step: "02",
        icon: Clock,
        title: "Get reviewed & approved",
        description:
            "Our team reviews every submission to ensure accuracy and quality. You'll be notified once approved.",
        accent: "text-violet-300",
        bg: "bg-violet-500/10 border-violet-400/20",
    },
    {
        step: "03",
        icon: Users,
        title: "Students discover you",
        description:
            "Thousands of university students browse UniLife daily to find exactly the services you offer.",
        accent: "text-blue-300",
        bg: "bg-blue-500/10 border-blue-400/20",
    },
];

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 60 : -60,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
        x: direction > 0 ? -60 : 60,
        opacity: 0,
    }),
};

export default function OnboardingPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);

    const providerData = userData as any;
    const firstName =
        providerData?.firstName ||
        providerData?.fullName?.split(" ")[0] ||
        "there";

    const goNext = () => {
        setDirection(1);
        setStep((s) => s + 1);
    };

    const goBack = () => {
        setDirection(-1);
        setStep((s) => s - 1);
    };

    return (
        <div className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex flex-col items-center justify-center py-10 px-4">
            {/* Background orbs */}
            <div
                className="orb w-[500px] h-[500px] bg-indigo-600 top-[-10%] left-[20%] pointer-events-none"
                style={{ opacity: 0.07 }}
            />
            <div
                className="orb w-[400px] h-[400px] bg-violet-700 bottom-[-5%] right-[10%] pointer-events-none"
                style={{ opacity: 0.07, animationDelay: "2s" }}
            />

            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-10 justify-center">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">U</span>
                    </div>
                    <span className="text-white font-semibold">UniLife Provider</span>
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                </div>

                {/* Progress steps */}
                <div className="flex items-center justify-center gap-0 mb-10">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <div className="flex flex-col items-center gap-1.5">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${step > s.id
                                            ? "bg-indigo-500 text-white"
                                            : step === s.id
                                                ? "bg-white/10 border border-indigo-400/40 text-indigo-300"
                                                : "bg-white/[0.04] border border-white/10 text-white/30"
                                        }`}
                                >
                                    {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                                </div>
                                <span
                                    className={`text-xs transition-colors duration-300 ${step === s.id ? "text-white/70" : "text-white/25"
                                        }`}
                                >
                                    {s.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`w-16 sm:w-24 h-px mx-2 mb-4 transition-colors duration-500 ${step > s.id ? "bg-indigo-500/60" : "bg-white/10"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card container */}
                <div
                    className="relative overflow-hidden rounded-3xl p-8"
                    style={{
                        background: "rgba(255,255,255,0.045)",
                        backdropFilter: "blur(32px)",
                        border: "1px solid rgba(255,255,255,0.09)",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none rounded-3xl" />

                    <AnimatePresence custom={direction} mode="wait">
                        {/* STEP 1 — Welcome */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="relative z-10 flex flex-col items-center text-center gap-6"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center">
                                    <GalleryVerticalEnd className="w-8 h-8 text-indigo-300" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-3">
                                        Welcome, {firstName}! 🎉
                                    </h1>
                                    <p className="text-white/55 text-base leading-relaxed">
                                        Your provider account is ready. UniLife connects you with
                                        thousands of university students across Sri Lanka who are
                                        actively looking for services like yours.
                                    </p>
                                </div>

                                {/* Quick stats */}
                                <div className="w-full grid grid-cols-3 gap-3">
                                    {[
                                        { value: "2,500+", label: "Active students" },
                                        { value: "3", label: "Universities" },
                                        { value: "Free", label: "Always" },
                                    ].map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="rounded-xl p-3 text-center"
                                            style={{
                                                background: "rgba(255,255,255,0.05)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                            }}
                                        >
                                            <div className="text-lg font-bold text-white">
                                                {stat.value}
                                            </div>
                                            <div className="text-xs text-white/40 mt-0.5">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={goNext}
                                    className="w-full bg-white text-black hover:bg-white/90 rounded-xl font-semibold py-5"
                                >
                                    Let&apos;s get started
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </motion.div>
                        )}

                        {/* STEP 2 — How it works */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="relative z-10 flex flex-col gap-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-white mb-2">
                                        How it works
                                    </h2>
                                    <p className="text-white/45 text-sm">
                                        Your journey from listing to discovery in three steps.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {HOW_IT_WORKS.map((item, i) => {
                                        const Icon = item.icon;
                                        return (
                                            <motion.div
                                                key={item.title}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 + 0.1 }}
                                                className={`flex items-start gap-4 rounded-2xl p-4 border ${item.bg}`}
                                            >
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 glass">
                                                    <Icon className={`w-5 h-5 ${item.accent}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span
                                                            className={`text-xs font-mono font-bold ${item.accent} opacity-60`}
                                                        >
                                                            {item.step}
                                                        </span>
                                                        <h3 className="text-white font-semibold text-sm">
                                                            {item.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-white/45 text-xs leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={goBack}
                                        className="flex-1 text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={goNext}
                                        className="flex-1 bg-white text-black hover:bg-white/90 rounded-xl font-semibold"
                                    >
                                        Got it
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 — Get started */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="relative z-10 flex flex-col items-center text-center gap-6"
                            >
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center"
                                >
                                    <CheckCircle className="w-8 h-8 text-emerald-300" />
                                </motion.div>

                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-3">
                                        You&apos;re all set!
                                    </h2>
                                    <p className="text-white/55 text-base leading-relaxed">
                                        Your provider account is active. Add your first business
                                        listing now, or explore your dashboard first.
                                    </p>
                                </div>

                                <div className="w-full flex flex-col gap-3">
                                    <Link href="/provider/businesses/new" className="w-full">
                                        <Button className="w-full bg-white text-black hover:bg-white/90 rounded-xl font-semibold py-5">
                                            <Building2 className="w-4 h-4 mr-2" />
                                            Add my first business
                                        </Button>
                                    </Link>
                                    <Link href="/provider/dashboard" className="w-full">
                                        <Button
                                            variant="ghost"
                                            className="w-full text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl"
                                        >
                                            Go to dashboard
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>

                                <p className="text-white/25 text-xs">
                                    You can add or manage your businesses anytime from the
                                    dashboard.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
