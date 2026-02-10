import { CodeIcon, PaletteIcon, ShieldIcon, ZapIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { BentoCard, BentoGrid } from "@/components/ui/magicui/bento-grid";
import { Marquee } from "@/components/ui/magicui/marquee";
import { cn } from "@/lib/utils";
import AnimatedBeamMultipleOutputDemo from "./animated-beam-demo";
import AnimatedListDemo from "./animated-list-demo";

const techStack = [
  {
    name: "AI Analysis",
    body: "Advanced machine learning models for intelligent document risk assessment.",
  },
  {
    name: "Compliance Check",
    body: "Automated regulatory compliance verification and legal requirement analysis.",
  },
  {
    name: "Risk Scoring",
    body: "Comprehensive risk scoring algorithms with detailed breakdown and insights.",
  },
  {
    name: "Real-time Processing",
    body: "Instant document analysis with real-time risk detection and alerts.",
  },
  {
    name: "Legal Review",
    body: "AI-powered legal document review with contract risk identification.",
  },
  {
    name: "Secure Storage",
    body: "Enterprise-grade security with encrypted document storage and processing.",
  },
];

const features = [
  {
    Icon: CodeIcon,
    name: "AI-Powered Analysis",
    description:
      "Advanced machine learning models analyze your documents for risks, compliance issues, and legal concerns with high accuracy.",
    href: "#",
    cta: "Learn More",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        {techStack.map((tech, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white ">
                  {tech.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{tech.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: ShieldIcon,
    name: "Compliance & Security",
    description:
      "Automated compliance checking with regulatory frameworks and enterprise-grade security for your sensitive documents.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90" />
    ),
  },
  {
    Icon: ZapIcon,
    name: "Real-time Risk Assessment",
    description:
      "Instant risk scoring and detailed breakdowns with actionable insights to help you make informed decisions.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: PaletteIcon,
    name: "Legal Document Review",
    description:
      "AI-powered legal document analysis with contract risk identification and professional-grade insights.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Learn More",
    background: (
      <Calendar
        mode="single"
        selected={new Date(2022, 4, 11, 0, 0, 0)}
        className="absolute right-0 top-10 origin-top scale-75 rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-90"
      />
    ),
  },
];

export default function Features() {
  return (
    <section id="features">
      <BentoGrid className="gap-6">
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </BentoGrid>
    </section>
  );
}
