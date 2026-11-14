import { redirect } from "next/navigation";
import { QUIZ_PATH } from "@/lib/auth/constants";

export default function LegacyHomePage() {
  redirect(QUIZ_PATH);
}
