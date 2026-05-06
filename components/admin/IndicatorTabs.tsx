"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  key: string;
  label: string;
  count: number;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
}

export default function IndicatorTabs({ tabs, activeTab }: Props) {
  return (
    <div className="flex gap-1 bg-dark-800 border border-dark-600 rounded-xl p-1 w-fit">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Link
            key={tab.key}
            href={`/admin/indicators?tab=${tab.key}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive
                ? "bg-gold-500 text-dark-900"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              isActive ? "bg-dark-900/30 text-dark-900" : "bg-dark-600 text-gray-500"
            }`}>
              {tab.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
