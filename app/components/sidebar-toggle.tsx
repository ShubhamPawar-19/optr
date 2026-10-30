
"use client";

import { PanelLeft } from "lucide-react";

export function SidebarToggle() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new Event("optr-toggle-sidebar"));
      }}
      aria-label="Toggle sidebar"
      title="Toggle sidebar"
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-400 bg-white text-[#292923]-600 transition hover:bg-[#292923]-100 hover:text-[#292923]-950"
    >
      <PanelLeft size={18} />
    </button>
  );
}
