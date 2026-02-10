"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export default function Footer({ className }: { className?: string }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className={cn(
        "w-full border-t border-white/20 dark:border-white/10 pt-12 pb-8 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-sm backdrop-saturate-150",
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Logo size="lg" className="mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              Intelligent document risk analysis platform powered by advanced
              AI. Identify, assess, and mitigate risks in your documents with
              compliance checking and actionable insights.
            </p>
            <div className="flex gap-4">
              <a
                href="https://riskread.ai/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                <span>View Demo</span>
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/dashboard/analyses/new"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  New Analysis
                </a>
              </li>
              <li>
                <a
                  href="https://riskread.ai/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Live Demo
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/docs"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="/api"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} RiskRead AI. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm transition-colors"
              aria-label="Back to top"
            >
              <ArrowUpIcon className="w-4 h-4" />
              <span>Back to top</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
