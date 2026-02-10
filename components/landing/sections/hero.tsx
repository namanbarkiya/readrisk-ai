"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/ui/logo";
import { AnimatedShinyText } from "@/components/ui/magicui/animated-shiny-text";
import { AuroraText } from "@/components/ui/magicui/aurora-text";
import { InteractiveHoverButton } from "@/components/ui/magicui/interactive-hover-button";
import { WordRotate } from "@/components/ui/magicui/word-rotate";
import { cn } from "@/lib/utils";

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleAuthButtonClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <section className="relative flex min-h-screen md:min-h-[90vh] flex-col items-center justify-center px-2 py-8 md:px-4 md:py-24 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
        {" "}
        <div className="z-10 flex items-center justify-center">
          <Logo size="xl" className="mb-4" />
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-center tracking-tight leading-tight">
          Intelligent <AuroraText>Document Risk</AuroraText> Analysis
        </h1>
        <div className="mt-2">
          <WordRotate
            words={[
              "AI-powered risk identification and assessment.",
              "Compliance checking and regulatory analysis.",
              "Legal document review and contract analysis.",
              "Real-time risk scoring and insights.",
              "Automated risk detection and mitigation.",
            ]}
            className="text-lg text-center md:text-xl text-neutral-600 dark:text-neutral-300 font-normal min-h-[2rem]"
            duration={2200}
          />
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-fit max-w-md mx-auto">
          <InteractiveHoverButton onClick={handleAuthButtonClick}>
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
          </InteractiveHoverButton>
          <InteractiveHoverButton
            onClick={() => window.open("https://riskread.ai/demo", "_blank")}
          >
            View Demo
          </InteractiveHoverButton>
        </div>
        <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          <p>Trusted by legal professionals worldwide • AI-powered analysis</p>
        </div>
      </div>
    </section>
  );
}
