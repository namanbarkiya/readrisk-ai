"use client";

import React from "react";
import { AnimatedShinyText } from "@/components/ui/magicui/animated-shiny-text";
import { cn } from "@/lib/utils";

const stats = [
  {
    value: "10K+",
    label: "Documents",
    description: "Analyzed with AI",
  },
  {
    value: "95%",
    label: "Accuracy",
    description: "Risk detection rate",
  },
  {
    value: "500+",
    label: "Companies",
    description: "Trust RiskRead AI",
  },
  {
    value: "24/7",
    label: "Processing",
    description: "Real-time analysis",
  },
];

export default function Stats() {
  return (
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <AnimatedShinyText className="text-sm font-normal text-neutral-600 dark:text-neutral-400 mb-4">
            ✨ Powered by advanced AI technology
          </AnimatedShinyText>
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Why professionals trust RiskRead AI
          </h2>
          <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Advanced AI-powered document analysis with industry-leading accuracy
            and comprehensive risk assessment capabilities.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center relative group">
              {/* Background card effect */}
              <div className="absolute inset-0 bg-white/30 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 p-6">
                {/* Number as header */}
                <div className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 tracking-tight">
                  {stat.value}
                </div>

                {/* Divider */}
                {/* <div className="w-16 h-0.5 bg-neutral-300 dark:bg-neutral-600 mx-auto mb-6" /> */}

                {/* Label */}
                <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wide">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {stat.description}
                </div>
              </div>

              {/* Vertical divider between stats (except last item) */}
              {index < stats.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-px h-20 bg-neutral-300 dark:bg-neutral-600 transform -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
