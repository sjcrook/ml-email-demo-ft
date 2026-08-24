import { create } from "zustand";

interface SearchState {
  qtext: string;
  collections: string[];
  searchResponse: any;
  dateRange: { start: Date; end: Date };
  tabSelected: number;
  setQtext: (qtext: string) => void;
  setCollections: (collections: string[]) => void;
  setSearchResponse: (response: any) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  setTabSelected: (tabSelected: number) => void;
}

const initialDateRange = {
  start: new Date(1980, 0, 1),
  end: new Date(2030, 0, 1),
};

// Kept in a store (instead of component state) so it survives SearchPage
// unmounting when the user navigates away (e.g. to the Alerts/bell page) and back.
const useSearchStore = create<SearchState>((set) => ({
  qtext: "",
  collections: [],
  searchResponse: null,
  dateRange: initialDateRange,
  tabSelected: 0,
  setQtext: (qtext) => set({ qtext }),
  setCollections: (collections) => set({ collections }),
  setSearchResponse: (response) => set({ searchResponse: response }),
  setDateRange: (range) => set({ dateRange: range }),
  setTabSelected: (tabSelected) => set({ tabSelected }),
}));

export default useSearchStore;