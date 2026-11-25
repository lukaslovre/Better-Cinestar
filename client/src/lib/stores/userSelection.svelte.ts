import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';
import { defaultSelection, type Selection, type SortOption } from '$lib/selection';

// The page renders on the server, so the selection cannot live in module-level stores:
// those would be shared between every request. Each page instance creates its own
// stores and hands them to components through context.

export interface UserSelectionStores {
  cinemaOids: Writable<string[]>;
  selectedDate: Writable<string>;
  sortBy: Writable<SortOption>;
  resetFiltersToDefault: () => void;
}

const CONTEXT_KEY = Symbol('userSelection');

export function createUserSelection(initial: Selection): UserSelectionStores {
  const cinemaOids = writable<string[]>([...initial.cinemaOids]);
  const selectedDate = writable<string>(initial.date);
  const sortBy = writable<SortOption>(initial.sortBy);

  const stores: UserSelectionStores = {
    cinemaOids,
    selectedDate,
    sortBy,
    resetFiltersToDefault() {
      const defaults = defaultSelection();
      cinemaOids.set(defaults.cinemaOids);
      selectedDate.set(defaults.date);
      sortBy.set(defaults.sortBy);
    }
  };

  setContext(CONTEXT_KEY, stores);
  return stores;
}

export function getUserSelection(): UserSelectionStores {
  const stores = getContext<UserSelectionStores | undefined>(CONTEXT_KEY);
  if (!stores) throw new Error('getUserSelection() called outside the page');
  return stores;
}
