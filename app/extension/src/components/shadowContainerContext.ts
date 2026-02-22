import { createContext, useContext } from "react";

export const ShadowContainerContext = createContext<HTMLElement | null>(null);

export const useShadowContainer = () => useContext(ShadowContainerContext);
