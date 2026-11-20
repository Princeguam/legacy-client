import type { AuthContextValue } from "@/types/Auth";
import { createContext } from "react";

export const authContext = createContext<AuthContextValue | null>(null);
