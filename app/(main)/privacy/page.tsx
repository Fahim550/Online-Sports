import PrivacyPage from "@/components/main/Privacy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the Privacy Policy of Suyeb Online Sports to learn how we protect and handle your personal information.",
};

export default function page() {
  return (
    <div>
      <PrivacyPage />
    </div>
  );
}

