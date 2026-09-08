"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });

    // PublicHeader locks the body while its mobile menu is open.
    const syncScrollLock = () => {
      if (document.body.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(syncScrollLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    syncScrollLock();

    return () => {
      observer.disconnect();
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
