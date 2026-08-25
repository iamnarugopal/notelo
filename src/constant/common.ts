import { ViewMode } from "@/utils/NoteStorage";
import {
    Grid2X2,
    Grid3X3,
    SquareMenu,
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
    title: "List Detail",
    slug: "listdetail",
    icon: SquareMenu,
  },
  {
    title: "Grid",
    slug: "grid",
    icon: Grid2X2,
  },
  {
    title: "Grid Detail",
    slug: "griddetail",
    icon: Grid3X3,
  },
];
