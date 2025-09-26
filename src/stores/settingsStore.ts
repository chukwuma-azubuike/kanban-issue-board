import { create } from 'zustand';

export interface SettingsState {
	darkMode: boolean;
	pollingIntervalSec: number;

	// actions
	setDarkMode: (v: boolean) => void;
	setPollingIntervalSec: (n: number) => void;
}

const STORAGE_KEY = 'kanban_settings_v1';

const DEFAULTS = {
	darkMode: false,
	pageSize: 10,
	pollingIntervalSec: 10,
	undoDurationSec: 5,
};

function loadInitial() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULTS;
		const parsed = JSON.parse(raw);
		return { ...DEFAULTS, ...parsed };
	} catch {
		return DEFAULTS;
	}
}

export const useSettingsStore = create<SettingsState>((set, get) => {
	const initial = loadInitial();

	// apply dark immediately
	if (initial.darkMode) document.documentElement.classList.add('dark');
	else document.documentElement.classList.remove('dark');

	// persist helper
	const persist = (partial: Partial<typeof initial>) => {
		try {
			const next = { ...getSettings(), ...partial };
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		} catch {
			// handle error
		}
	};

	const getSettings = () => ({
		darkMode: get().darkMode,
		pollingIntervalSec: get().pollingIntervalSec,
	});

	// initialize store values
	set(() => ({
		darkMode: initial.darkMode,
		pollingIntervalSec: initial.pollingIntervalSec,

		setDarkMode: (v: boolean) => {
			document.documentElement.classList.toggle('dark', v);
			set({ darkMode: v });
			persist({ darkMode: v });
		},

		setPollingIntervalSec: (n: number) => {
			set({ pollingIntervalSec: n });
			persist({ pollingIntervalSec: n });
		},
	}));

	// no return — store created
	return get();
});
