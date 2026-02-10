"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/magicui/marquee";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah Chen",
    handle: "@sarahlegal",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
    content:
      "RiskRead AI has transformed our document review process. The AI accurately identifies risks we might have missed, saving us hours of manual review.",
    role: "Senior Legal Counsel",
  },
  {
    name: "Alex Rodriguez",
    handle: "@alexcompliance",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content:
      "The compliance checking feature is incredible. It automatically flags regulatory issues and provides clear explanations for each concern.",
    role: "Compliance Officer",
  },
  {
    name: "Maya Patel",
    handle: "@mayarisk",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content:
      "As a risk manager, I need tools that are both accurate and fast. RiskRead AI delivers on both counts with detailed risk scoring and insights.",
    role: "Risk Manager",
  },
  {
    name: "Jordan Kim",
    handle: "@jordancontracts",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content:
      "The contract analysis feature is a game-changer. It identifies potential issues and suggests improvements, making our contracts more robust.",
    role: "Contract Manager",
  },
  {
    name: "Emma Thompson",
    handle: "@emmaaudit",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    content:
      "RiskRead AI has become an essential part of our audit process. The detailed reports help us provide better insights to our clients.",
    role: "Audit Partner",
  },
  {
    name: "David Park",
    handle: "@davidlegaltech",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    content:
      "The AI-powered analysis is incredibly accurate. It catches subtle legal risks that even experienced lawyers might overlook.",
    role: "Legal Technology Director",
  },
];

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) {
  return (
    <Card
      className={cn(
        "w-80 h-48 p-6 mx-3",
        "bg-white/30 dark:bg-white/5",
        "border border-white/20 dark:border-white/10",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        "hover:shadow-xl hover:shadow-black/8 dark:hover:shadow-black/30 hover:scale-[1.02] transition-all duration-500",
        "backdrop-blur-sm backdrop-saturate-150",
        "hover:backdrop-blur-md",
        "relative"
      )}
    >
      <CardContent className="p-0 h-full flex flex-col justify-between relative z-10">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
          &ldquo;{testimonial.content}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback>
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
              {testimonial.name}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {testimonial.role} • {testimonial.handle}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Testimonials() {
  return (
    <section className="px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
          Trusted by legal professionals worldwide
        </h2>
        <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Join thousands of legal professionals who rely on RiskRead AI for
          intelligent document analysis and risk assessment.
        </p>
      </div>

      <div className="relative">
        <Marquee pauseOnHover className="[--duration:40s]">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </Marquee>

        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
      </div>
    </section>
  );
}
