import AuthGuard from "@/components/AuthGuard";
import ATSScanner from "@/components/ATSScanner";

export default function ATSPage() {
  return (
    <AuthGuard toolName="ATS Scanner" serviceKey="ats">
      <ATSScanner />
    </AuthGuard>
  );
}
