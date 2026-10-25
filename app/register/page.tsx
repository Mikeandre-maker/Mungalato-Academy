import type { Metadata } from "next";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { RegisterForm } from "@/components/onboarding/register-form";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Join Venture Arena and start building, surviving, and pitching your venture.",
};

const highlights = [
  {
    title: "Build a venture profile",
    body: "Pick your industry, define your customer, and shape the solution you'll defend.",
  },
  {
    title: "Survive the simulation",
    body: "Make pricing, hiring, and marketing calls and watch your runway respond.",
  },
  {
    title: "Pitch the Investment Den",
    body: "Face AI investors who probe your numbers and score your founder signal.",
  },
];

export default function RegisterPage() {
  return (
    <OnboardingShell
      eyebrow="JOIN THE ARENA"
      title={
        <>
          Every founder starts with <em>one decision.</em>
        </>
      }
      description="Create a free account to save your ventures, track your competencies, and return to the Den whenever you're ready."
      highlights={highlights}
    >
      <RegisterForm />
    </OnboardingShell>
  );
}
