// @vitest-environment node

import fs from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => fs.readFileSync(path, "utf8");

describe("dashboard sidebar collapse", () => {
  it("persists the desktop collapse preference", () => {
    const layout = read("src/app/(dashboard)/layout.js");

    expect(layout).toContain('window.localStorage.getItem("dashboard-sidebar-collapsed")');
    expect(layout).toContain('window.localStorage.setItem("dashboard-sidebar-collapsed", String(next))');
    expect(layout).toContain('className={isSidebarCollapsed ? "sidebar-collapsed" : ""}');
  });

  it("provides an accessible collapse control and compact labels", () => {
    const sideNav = read("src/app/components/layout/SideNav.tsx");

    expect(sideNav).toContain('className="side-nav-collapse-button"');
    expect(sideNav).toContain('aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}');
    expect(sideNav).toContain('className="side-nav-label"');
    expect(sideNav).toContain('title={item.label}');
  });

  it("resizes dashboard chrome and preserves the mobile drawer", () => {
    const styles = read("src/app/ui/dashboard/shell-and-upload.css");

    expect(styles).toContain('.app-shell.sidebar-collapsed .side-nav');
    expect(styles).toContain('.app-shell.sidebar-collapsed .content-canvas');
    expect(styles).toContain('.app-shell.sidebar-collapsed .top-bar');
    expect(styles).toContain('@media (max-width: 767px)');
    expect(styles).toContain('.side-nav .side-nav-collapse-button');
    expect(styles).toContain('display: none !important;');
  });
});
