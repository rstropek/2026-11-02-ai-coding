"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useToast } from "./toast";

/**
 * Shows a message passed through the URL after a redirect (?meldung=…) once,
 * then removes it from the URL so a reload does not repeat it.
 */
export function FlashToast({ message }: { message: string | undefined }) {
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!message) {
      // The URL no longer has the message. Next keeps this page alive for a
      // later visit, which may bring the same message again (the same
      // product saved twice), so forget what was shown.
      shown.current = undefined;
      return;
    }
    if (shown.current !== message) {
      shown.current = message;
      toast(message);
      router.replace(pathname, { scroll: false });
    }
  }, [message, pathname, router, toast]);

  return null;
}
