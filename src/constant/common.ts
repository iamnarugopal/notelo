import type { SortMode } from "@/utils/NoteStorage";
import { ViewMode } from "@/utils/NoteStorage";
import {
  ArrowDownAZ,
  ArrowDownUp,
  Grid2X2,
  Grid3X3,
  Rows2,
  TextAlignJustify,
  type LucideProps,
} from "lucide-react-native";
import type { ComponentType } from "react";

interface ViewListProps {
  title: string;
  slug: ViewMode;
  icon: ComponentType<LucideProps>;
}

export const ViewList: ViewListProps[] = [
  {
    title: "List",
    slug: "list",
    icon: TextAlignJustify,
  },
  {
    title: "Details",
    slug: "listdetail",
    icon: Rows2,
  },
  {
    title: "Large Grid",
    slug: "grid",
    icon: Grid2X2,
  },
  {
    title: "Grid",
    slug: "griddetail",
    icon: Grid3X3,
  },
];

interface SortListProps {
  title: string;
  slug: SortMode;
  icon: ComponentType<LucideProps>;
}

export const SortList: SortListProps[] = [
  { title: "By modified time", slug: "modified", icon: ArrowDownUp },
  { title: "By created time", slug: "created", icon: ArrowDownUp },
  { title: "Alphabetically", slug: "alphabetical", icon: ArrowDownAZ },
];
