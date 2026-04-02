import { GlassCard } from "@/components/layout/GlassCard";
import { motion } from "framer-motion";
import {
  StoryboardIcon,
  AIPolishIcon,
  CollaborationIcon,
  ExportIcon,
  VersionHistoryIcon,
  BenefitConsistencyIcon,
  BenefitWorkflowIcon,
} from "./SectionIcons";

const features = [
  {
    icon: StoryboardIcon,
    title: "Storyboard-first from the first frame",
    description:
      "Sequence frames, durations, and motion notes on the canvas before anyone starts chasing a render.",
    color: "from-sm-pink to-sm-coral",
  },
  {
    icon: AIPolishIcon,
    title: "Direction Studio stays in the loop",
    description:
      "Mood, pacing, camera, lighting, color, and continuity stay attached to the board instead of getting lost in a separate brief.",
    color: "from-sm-soft-purple to-sm-purple",
  },
  {
    icon: BenefitWorkflowIcon,
    title: "Live planning from the board you already have",
    description:
      "The GLM Director Workflow turns ordered storyboard context into analysis, shot planning, continuity rules, and a render strategy.",
    color: "from-sm-magenta to-sm-pink",
  },
  {
    icon: BenefitConsistencyIcon,
    title: "Continuity issues surface early",
    description:
      "Catch drift in pacing, camera logic, and scene continuity before the team spends time polishing the wrong beat.",
    color: "from-sm-mint to-sm-soft-purple",
  },
  {
    icon: VersionHistoryIcon,
    title: "Revision-aware shot planning",
    description:
      "Change the direction, keep the board, and update the plan without restarting from zero every time feedback lands.",
    color: "from-sm-coral to-sm-pink",
  },
  {
    icon: CollaborationIcon,
    title: "One canvas for the whole review loop",
    description:
      "Creative leads, storyboard artists, and collaborators can work in one place instead of hopping between notes, boards, and prompt docs.",
    color: "from-sm-purple to-sm-magenta",
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

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <BenefitWorkflowIcon className="w-4 h-4" />
            <span className="text-sm font-medium text-white">Storyboard-first creative control</span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            One workspace for{" "}
            <span className="gradient-text">direction, planning, and revision.</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Instead of jumping from storyboard to prompt doc to review notes, shape the direction
            and keep the plan attached to the board the team is already using.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <GlassCard hover className="p-6 h-full group">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-glow transition-shadow`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="font-display font-bold text-xl text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <GlassCard className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
                How SketchMotion flows today
              </h3>
              <p className="text-white/70">
                Sequence the board, save direction, and revise the live plan without breaking the
                review loop.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sm-pink to-sm-coral flex items-center justify-center shadow-lg">
                    <StoryboardIcon className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-sm-charcoal font-bold flex items-center justify-center text-lg shadow-lg">
                    1
                  </div>
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-2">Build the board</h4>
                <p className="text-white/60 text-sm">
                  Arrange storyboard frames, durations, and motion notes on the same canvas the
                  team reviews.
                </p>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <svg className="w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h14M14 7l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="text-center md:col-start-2 md:row-start-1">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sm-soft-purple to-sm-purple flex items-center justify-center shadow-lg">
                    <BenefitWorkflowIcon className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-sm-charcoal font-bold flex items-center justify-center text-lg shadow-lg">
                    2
                  </div>
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-2">Set direction</h4>
                <p className="text-white/60 text-sm">
                  Save mood, pacing, camera, lighting, and continuity so the live plan knows what
                  the board is aiming for.
                </p>
              </div>

              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sm-magenta to-sm-pink flex items-center justify-center shadow-lg animate-pulse-glow">
                    <ExportIcon className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-sm-charcoal font-bold flex items-center justify-center text-lg shadow-lg">
                    3
                  </div>
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-2">Review and revise</h4>
                <p className="text-white/60 text-sm">
                  Read the plan, adjust the direction, and hand off a clearer creative path before
                  moving into polish or export.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
