"use client";

import { createContext, useContext } from "react";

export const PaidContext = createContext(false);
export const usePaid = () => useContext(PaidContext);
