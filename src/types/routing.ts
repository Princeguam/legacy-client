import type { PAGE_PATHS } from '@/constants/strings'
import type { ComponentType, LazyExoticComponent } from "react";

export type ScreenRoute = {
    path: (typeof PAGE_PATHS)[keyof typeof PAGE_PATHS];
    Page: LazyExoticComponent<ComponentType>;
};
