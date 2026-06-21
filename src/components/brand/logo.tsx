import Image from "next/image";
import logoImg from "@/app/icon.png";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants/config";

/**
 * The Transora logo image (mark + wordmark). Single source of truth for the
 * in-app logo — rendered from the same icon.png that is used for the favicon.
 * Pass the rendered `height` in px; width is derived from the image ratio.
 */
export function Logo({
  height = 36,
  className,
}: {
  height?: number;
  className?: string;
}) {
  const width = Math.round((height * logoImg.width) / logoImg.height);
  return (
    <Image
      src={logoImg}
      alt={`${APP_NAME} logo`}
      width={width}
      height={height}
      priority
      className={cn("select-none", className)}
      style={{ height, width: "auto" }}
    />
  );
}
