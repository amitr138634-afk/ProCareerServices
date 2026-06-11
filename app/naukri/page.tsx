import AuthGuard from "@/components/AuthGuard";
import NaukriOptimizer from "@/components/NaukriOptimizer";

export const metadata = {
  title: "Naukri Profile Optimizer — Shyam Pro Services",
  description: "Optimize your Naukri profile with AI. Get 5x more recruiter calls. ₹200 one-time, first 4 sections free.",
};

export default function NaukriPage() {
  return (
    <AuthGuard toolName="Naukri Optimizer" serviceKey="naukri">
      <NaukriOptimizer />
    </AuthGuard>
  );
}
