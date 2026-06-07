import AuthGuard from "@/components/AuthGuard";
import LinkedInOptimizer from "@/components/LinkedInOptimizer";

export default function OptimizePage() {
  return (
    <AuthGuard toolName="LinkedIn Optimizer" serviceKey="linkedin">
      <LinkedInOptimizer />
    </AuthGuard>
  );
}
