"use client";

import { useEffect } from "react";

export default function LandingEffects() {
  useEffect(() => {
    document.body.classList.add("landing-page");
    return () => document.body.classList.remove("landing-page");
  }, []);

  return null;
}
