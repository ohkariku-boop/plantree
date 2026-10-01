import { Plant, JournalEntry, AppSettings } from '../types';

const PLANTS_KEY = 'plantree_plants';
const JOURNAL_KEY = 'plantree_journal';
const SETTINGS_KEY = 'plantree_settings';

export function getPlants(): Plant[] {
  try {
    const raw = localStorage.getItem(PLANTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePlants(plants: Plant[]): void {
  localStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
}

export function addPlant(plant: Plant): void {
  const plants = getPlants();
  plants.unshift(plant);
  savePlants(plants);
}

export function updatePlant(id: string, updates: Partial<Plant>): void {
  const plants = getPlants().map(p => (p.id === id ? { ...p, ...updates } : p));
  savePlants(plants);
}

export function deletePlant(id: string): void {
  const plants = getPlants().filter(p => p.id !== id);
  savePlants(plants);
  // also clean journal
  const journal = getJournal().filter(e => e.plantId !== id);
  saveJournal(journal);
}

export function getJournal(plantId?: string): JournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    const all: JournalEntry[] = raw ? JSON.parse(raw) : [];
    return plantId ? all.filter(e => e.plantId === plantId) : all;
  } catch {
    return [];
  }
}

export function saveJournal(entries: JournalEntry[]): void {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
}

export function addJournalEntry(entry: JournalEntry): void {
  const entries = getJournal();
  entries.unshift(entry);
  saveJournal(entries);
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
