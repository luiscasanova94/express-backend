import { Person } from '../interfaces/person.interface';

const STORAGE_KEY = 'app_state';
const STATE_TTL = 24 * 60 * 60 * 1000; 

class StateService {
  private _persons: Person[] = [];
  private _loading = false;
  private _error: string | null = null;
  private _searchQuery: string | any = null;
  private _searchType: string | null = null; 
  public newSearchPerformed = false;
  private _searchFilters: any = null;
  private _skipAgeRange = false; 

  private _totalResults = 0;
  private _currentPage = 1;
  private _limit = 5;
  private _sort: any = { first_name: 'asc' };

  private subscribers: Function[] = [];

  constructor() {
    this.loadStateFromStorage();
  }

  private saveStateToStorage() {
    const stateToSave = {
      persons: this._persons,
      searchQuery: this._searchQuery,
      searchType: this._searchType,
      newSearchPerformed: this.newSearchPerformed,
      searchFilters: this._searchFilters,
      skipAgeRange: this._skipAgeRange, 
      totalResults: this._totalResults,
      currentPage: this._currentPage,
      limit: this._limit,
      sort: this._sort,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }

  private loadStateFromStorage() {
    const savedStateJSON = localStorage.getItem(STORAGE_KEY);
    if (!savedStateJSON) return;

    const savedState = JSON.parse(savedStateJSON);
    const now = Date.now();

    if (now - savedState.timestamp > STATE_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    this._persons = savedState.persons || [];
    this._searchQuery = savedState.searchQuery || null;
    this._searchType = savedState.searchType || null;
    this.newSearchPerformed = savedState.newSearchPerformed || false;
    this._searchFilters = savedState.searchFilters || null;
    this._skipAgeRange = savedState.skipAgeRange || false; 
    this._totalResults = savedState.totalResults || 0;
    this._currentPage = savedState.currentPage || 1;
    this._limit = savedState.limit || 5;
    this._sort = savedState.sort || { first_name: 'asc' };
  }

  // Getters y Setters
  get persons(): Person[] { return this._persons; }
  set persons(value: Person[]) { this._persons = value; this.saveStateToStorage(); this.notify(); }

  get loading(): boolean { return this._loading; }
  set loading(value: boolean) { this._loading = value; this.notify(); }

  get error(): string | null { return this._error; }
  set error(value: string | null) { this._error = value; this.notify(); }

  get searchQuery(): string | any { return this._searchQuery; }
  set searchQuery(value: string | any) { this._searchQuery = value; this.saveStateToStorage(); this.notify(); }

  get searchType(): string | null { return this._searchType; }
  set searchType(value: string | null) { this._searchType = value; this.saveStateToStorage(); this.notify(); }

  get searchFilters(): any { return this._searchFilters; }
  set searchFilters(value: any) { this._searchFilters = value; this.saveStateToStorage(); this.notify(); }

  get skipAgeRange(): boolean { return this._skipAgeRange; }
  set skipAgeRange(value: boolean) { this._skipAgeRange = value; this.saveStateToStorage(); this.notify(); } // Añadido

  get totalResults(): number { return this._totalResults; }
  set totalResults(value: number) { this._totalResults = value; this.saveStateToStorage(); this.notify(); }

  get currentPage(): number { return this._currentPage; }
  set currentPage(value: number) { this._currentPage = value; this.saveStateToStorage(); this.notify(); }

  get limit(): number { return this._limit; }
  set limit(value: number) { this._limit = value; this.saveStateToStorage(); this.notify(); }

  get sort(): any { return this._sort; }
  set sort(value: any) { this._sort = value; this.saveStateToStorage(); this.notify(); }

  subscribe(callback: Function) { this.subscribers.push(callback); }
  unsubscribe(callback: Function) { this.subscribers = this.subscribers.filter(sub => sub !== callback); }
  private notify() { this.subscribers.forEach(callback => callback()); }

  public clearStateAndStorage() {
    this._persons = [];
    this._searchQuery = null;
    this._searchType = null;
    this.newSearchPerformed = false;
    this._totalResults = 0;
    this._currentPage = 1;
    this._limit = 5;
    this._sort = { first_name: 'asc' };
    this._searchFilters = null;
    this._skipAgeRange = false; 
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }
}

export const stateService = new StateService();