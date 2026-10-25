import type { Metadata } from "next";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { PilotForm } from "@/components/onboarding/pilot-form";

export const metadata: Metadata = {
  title: "Run a pilot",
  description:
    "Bring Venture Arena to your university, incubator, or programme with a guided pilot cohort.",
};

const highlights = [
  {
    title: "Cohort dashboard",
    body: "Track every participant's decisions, pitch scores, and competency growth.",
  },
  {
    title: "Facilitator support",
    body: "Onboarding sessions and a playbook for running the simulation in class or online.",
  },
  {
    title: "Impact report",
    body: "A summary of your cohort's progress you can share with funders and leadership.",
  },
];

export default function PilotPage() {
  return (
    <OnboardingShell
      eyebrow="INSTITUTIONAL PILOT"
      title={
        <>
          Train your next cohort in <em>the Arena.</em>
        </>
      }
      description="We're partnering with a small group of universities, incubators, and programmes across Africa to run guided pilots in 2027."
      highlights={highlights}
    >
      <PilotForm />
    </OnboardingShell>
  );
}
