import { Person } from '../interfaces/person.interface.ts';

const STORAGE_KEY = 'app_state';
const STATE_TTL = 24 * 60 * 60 * 1000;

class StateService {
  private _persons: Person[] = [];
  private _loading = false;
  private _error: string | null = null;
  private _searchQuery: string | null = null;
  private _searchType: string | null = null; 

  private subscribers: Function[] = [];

  constructor() {
    this.loadStateFromStorage();
  }


  private saveStateToStorage() {
    const stateToSave = {
      persons: this._persons,
      searchQuery: this._searchQuery,
      searchType: this._searchType,
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
  }


  public clearStateOnNewSearch() {
    this._persons = [];
    this._searchQuery = null;
    this._searchType = null;
    this.notify();
  }


  get persons(): Person[] {
    return this._persons;
  }

  set persons(persons: Person[]) {
    this._persons = persons;
    this.saveStateToStorage(); 
    this.notify();
  }

  get firstPerson(): Person | null {
    return this._persons.length > 0 ? this._persons[0] : null;
  }

  get loading(): boolean {
    return this._loading;
  }

  set loading(isLoading: boolean) {
    this._loading = isLoading;
    this.notify();
  }

  get error(): string | null {
    return this._error;
  }

  set error(errorMessage: string | null) {
    this._error = errorMessage;
    this.notify();
  }

  get searchQuery(): string | null {
    return this._searchQuery;
  }

  set searchQuery(query: string | null) {
    this._searchQuery = query;
    this.saveStateToStorage(); 
    this.notify();
  }

  get searchType(): string | null {
    return this._searchType;
  }

  set searchType(type: string | null) {
    this._searchType = type;
    this.saveStateToStorage();
    this.notify();
  }
  
  subscribe(callback: Function) {
    this.subscribers.push(callback);
  }

  unsubscribe(callback: Function) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  private notify() {
    this.subscribers.forEach(callback => callback());
  }
}

export const stateService = new StateService();