import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";

interface DoesDataExistContextType {
  doesDataExist: number;
  setDoesDataExist: Dispatch<SetStateAction<number>>;
}

export const DoesDataExistContext = createContext<
  DoesDataExistContextType | undefined
>(undefined);
