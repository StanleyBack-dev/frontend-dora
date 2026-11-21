import {
  Backpack,
  IdCard,
  KeyRound,
  type LucideIcon,
  Package,
  Shirt,
  Smartphone,
  ToyBrick,
  Watch,
} from "lucide-react";
import type { FoundItemCategory } from "@/shared/contracts/lost-and-found";

/** The icon of each category (cards without a photo, the claims). */
export const FOUND_ITEM_CATEGORY_ICONS: Record<FoundItemCategory, LucideIcon> =
  {
    DOCUMENT: IdCard,
    KEYS: KeyRound,
    ELECTRONICS: Smartphone,
    CLOTHING: Shirt,
    ACCESSORY: Watch,
    BAG: Backpack,
    TOY: ToyBrick,
    OTHER: Package,
  };
