import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "white" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  href?: string;
}

export function Logo({
  variant = "default",
  size = "md",
  className,
  showText = true,
  href,
}: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const logoSource = variant === "white" ? "/logo.svg" : "/logo.png";
  const altText = "RiskRead AI Logo";

  const LogoContent = () => (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative flex-shrink-0", sizeClasses[size])}>
        <Image
          src={logoSource}
          alt={altText}
          width={48}
          height={48}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight",
            textSizes[size],
            variant === "white" && "text-white",
            variant === "dark" && "text-gray-900",
            variant === "default" && "text-foreground"
          )}
        >
          RiskRead AI
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        <LogoContent />
      </a>
    );
  }

  return <LogoContent />;
}

// Simple logo icon without text
export function LogoIcon({
  size = "md",
  className,
  variant = "default",
}: Omit<LogoProps, "showText" | "href">) {
  return (
    <Logo
      size={size}
      className={className}
      variant={variant}
      showText={false}
    />
  );
}
