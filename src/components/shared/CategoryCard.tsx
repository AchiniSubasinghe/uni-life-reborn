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
    <Link href={linkHref}>
      <Card
        className={cn(
          "group cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
          className
        )}
      >
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {category.description}
          </p>
          {category.businessCount > 0 && (
            <span className="mt-3 text-xs text-muted-foreground">
              {category.businessCount} {category.businessCount === 1 ? "listing" : "listings"}
            </span>
          )}
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
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted text-foreground"
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
