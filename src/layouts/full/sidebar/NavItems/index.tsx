import React from "react";
import { ChildItem } from "../Sidebaritems";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router";

interface NavItemsProps {
  item: ChildItem;
}
const NavItems: React.FC<NavItemsProps> = ({ item }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const isActive = item.url === pathname;

  return (
    <Link
      to={item.url!}
      target={item.isPro ? '_blank' : '_self'}
      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
        isActive
          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold shadow-sm active"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="flex gap-3 items-center">
          {item.icon ? (
            <Icon 
              icon={item.icon} 
              className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? 'text-slate-950 font-bold' : (item.color || 'opacity-70 group-hover:opacity-100')
              }`} 
              height={19} 
            />
          ) : (
            <span
              className={`rounded-full mx-1.5 h-2 w-2 shrink-0 ${
                isActive ? "bg-slate-950" : "bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-500"
              }`}
            />
          )}
          <span className="max-w-36 text-ellipsis overflow-x-hidden whitespace-nowrap">
            {item.name}
          </span>
        </span>
        {item.isPro ? (
          <span className="py-0 px-2 text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-full font-bold">
            Pro
          </span>
        ) : null}
      </div>
    </Link>
  );
};

export default NavItems;
