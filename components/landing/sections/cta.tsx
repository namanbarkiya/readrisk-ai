"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { useAuth } from "@/components/providers/auth-provider";
import { InteractiveHoverButton } from "@/components/ui/magicui/interactive-hover-button";

export default function CTA() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const handleDemo = () => {
    window.open("https://riskread.ai/demo", "_blank");
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-left">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4 backdrop-blur-sm">
                ⚡ Ready to analyze documents?
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight">
                Start analyzing documents with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  AI-powered risk assessment
                </span>
              </h2>

              <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-8 leading-relaxed">
                Transform your document review process with intelligent AI
                analysis. Identify risks, ensure compliance, and make informed
                decisions faster.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>AI-powered risk identification</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Compliance checking & validation</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Real-time analysis & insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - CTA Card */}
          <div className="bg-white/35 dark:bg-white/5 backdrop-blur-sm backdrop-saturate-150 border border-white/20 dark:border-white/10 rounded-2xl p-8 shadow-xl shadow-black/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:scale-[1.02] hover:backdrop-blur-md transition-all duration-500 relative">
            <div className="text-center relative z-10">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Start analyzing today
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Choose your preferred way to get started
              </p>

              <div className="space-y-3">
                <InteractiveHoverButton onClick={handleGetStarted}>
                  {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                </InteractiveHoverButton>

                <InteractiveHoverButton onClick={handleDemo}>
                  View Demo
                </InteractiveHoverButton>
              </div>

              <div className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
                <p>14-day free trial • No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
