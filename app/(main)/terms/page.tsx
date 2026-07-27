import TermsPage from "@/components/main/Terms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions governing the use of Suyeb Online Sports website, purchase agreements, and services.",
};

export default function page() {
  return (
    <div>
      <TermsPage />
    </div>
  );
}

