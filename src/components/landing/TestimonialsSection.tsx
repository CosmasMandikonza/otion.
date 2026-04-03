import { GlassCard } from "@/components/layout/GlassCard";
import { motion } from "framer-motion";
import {
  BenefitSpeedIcon,
  BenefitConsistencyIcon,
  CollaborationIcon,
  ExportIcon,
} from "./SectionIcons";

const benefits = [
  {
    icon: BenefitSpeedIcon,
    heading: "Fewer review resets",
    description:
      "The team can move from rough board to a concrete shot plan faster because direction and revision context live beside the frames.",
  },
  {
    icon: BenefitConsistencyIcon,
    heading: "Continuity stays visible",
    description:
      "Camera intent, pacing, and continuity rules are surfaced before the work gets polished into something expensive to redo.",
  },
  {
    icon: CollaborationIcon,
    heading: "Creative notes stop fragmenting",
    description:
      "Storyboard edits, direction changes, and review feedback stay in one canvas instead of splitting across docs and chat threads.",
  },
  {
    icon: ExportIcon,
    heading: "Better handoff into the next pass",
    description:
      "Once the board feels right, the team has a readable plan to hand into polish, drafting tools, and export without guessing what changed.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 px-4 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <BenefitSpeedIcon className="w-4 h-4" />
            <span className="text-sm font-medium text-white">Built for the review loop</span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Direction gets{" "}
            <span className="gradient-text">clearer before production.</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            SketchMotion is strongest when a creative team needs to align the storyboard, plan the
            next pass, and react to feedback without losing the thread.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div key={benefit.heading} variants={itemVariants}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sm-magenta/20 to-sm-purple/20 flex items-center justify-center mb-4 border border-white/10">
                    <Icon className="w-6 h-6 text-sm-magenta" />
                  </div>

                  <h3 className="font-display font-bold text-xl text-white mb-2">{benefit.heading}</h3>
                  <p className="text-white/70 leading-relaxed">{benefit.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
