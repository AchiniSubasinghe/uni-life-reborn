"use client";

import {
  Building2,
  UtensilsCrossed,
  ShoppingCart,
  Pill,
  Shirt,
  BookOpen,
  Dumbbell,
  Coffee,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Category, BusinessCategory } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  href?: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  Building2: Building2,
  UtensilsCrossed: UtensilsCrossed,
  ShoppingCart: ShoppingCart,
  Pill: Pill,
  Shirt: Shirt,
  BookOpen: BookOpen,
  Dumbbell: Dumbbell,
  Coffee: Coffee,
  MoreHorizontal: MoreHorizontal,
};

export function CategoryCard({ category, href, className }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || MoreHorizontal;
  const linkHref = href || `/browse?category=${category.slug}`;

  return (
    <Link href={linkHref} className="block h-full">
      <Card
        className={cn(
          "group h-full cursor-pointer transition-all hover:shadow-[0_8px_40px_rgba(217,119,6,0.18)] hover:border-white/20",
          className
        )}
      >
        <CardContent className="p-6 h-full flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-amber-500/15 border border-amber-400/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/25 transition-colors">
            <Icon className="h-7 w-7 text-amber-300" />
          </div>
          <h3 className="font-semibold text-lg group-hover:text-amber-300 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-10">
            {category.description}
          </p>
          <span
            className={cn(
              "mt-3 text-xs text-muted-foreground min-h-4",
              category.businessCount > 0 ? "visible" : "invisible"
            )}
          >
            {category.businessCount} {category.businessCount === 1 ? "listing" : "listings"}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

// Simplified category item for sidebar/filter lists
interface CategoryItemProps {
  category: Category;
  isSelected?: boolean;
  onClick?: () => void;
  count?: number;
}

export function CategoryItem({
  category,
  isSelected = false,
  onClick,
  count,
}: CategoryItemProps) {
  const Icon = iconMap[category.icon] || MoreHorizontal;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
        isSelected
          ? "bg-amber-500/15 border border-amber-400/20 text-amber-300"
          : "hover:bg-white/[0.06] text-white/70 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium">{category.name}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">{count}</span>
      )}
    </button>
  );
}
