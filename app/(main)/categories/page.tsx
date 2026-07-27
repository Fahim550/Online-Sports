import CategoriesPage from "@/components/main/Categories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Categories",
  description: "Explore sports gear and apparel by category — jerseys, football, cricket, badminton, fitness gear, and athletic accessories.",
};

export default function page() {
  return (
    <div>
      <CategoriesPage />
    </div>
  );
}

