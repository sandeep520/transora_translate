import type { Metadata } from "next";
import { GoogleLens } from "@/components/google-lens/google-lens";

export const metadata: Metadata = {
  title: "Google Lens Translator",
  description:
    "Upload an image, extract text with OCR, translate it into any language, and download the translated image — free and in your browser.",
};

export default function GoogleLensPage() {
  return <GoogleLens />;
}
