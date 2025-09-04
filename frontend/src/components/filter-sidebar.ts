import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { US_STATES, CITIES_BY_STATE } from '../data/states-cities.data';
import mainStyles from '../styles/main.css?inline';
import { AddressAutofillCore, SessionToken } from '@mapbox/search-js-core';
import { stateService } from '../services/state.service';

interface FilterFilters {
  firstName?: string;
  lastName?: string;
  state?: string;
  city?: string;
  ageMin?: number;
  ageMax?: number;
  address?: string;
  addressObj?: any;
}

@customElement('filter-sidebar')
export class FilterSidebar extends LitElement {
  @property({ type: Object }) initialFilters: FilterFilters = {};
  @property({ type: String }) searchType: string = '';

  @state() private firstName = '';
  @state() private lastName = '';
  @state() private selectedState = '';
  @state() private selectedCity = '';
  @state() private ageMin = 18;
  @state() private ageMax = 65;
  @state() private addressInput = '';
  @state() private addressObj: any = null;
  @state() private addressSuggestions: any[] = [];
  
  @query('#address') private _addressInputElement!: HTMLInputElement;

  private _mapboxSearch = new AddressAutofillCore({ accessToken: import.meta.env.VITE_MAPBOX_API_TOKEN });
  private _sessionToken = new SessionToken();
  private _debounceTimer: number | undefined;

  static styles = css`
    :host { display: block; }
    .filter-container {
      background-color: #2d2d2d;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 1.5rem;
      color: white;
      width: 100%;
    }
    .title {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #444;
      padding-bottom: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
      position: relative;
    }
    label {
      display: block;
      font-weight: 500;
      color: #d1d5db;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    input, select {
      width: 100%;
      padding: 0.65rem;
      border: 2px solid #4b5563;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      background-color: #374151;
      color: white;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #eb4538;
    }
    select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .age-inputs {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .apply-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #eb4538;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      margin-top: 1.5rem;
      transition: background-color 0.3s ease;
    }
    .apply-button:hover {
      background-color: #d33a2e;
    }
    .suggestions {
      background-color: white;
      color: #1a1a1a;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      margin-top: 0.25rem;
      max-height: 12rem;
      overflow-y: auto;
      z-index: 50;
      position: absolute;
      width: 100%;
      top: 100%;
      left: 0;
    }
    .suggestion-item {
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
    .suggestion-item:hover {
      background-color: #f3f4f6;
    }
    ${unsafeCSS(mainStyles)}
  `;

  async updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('initialFilters')) {
      const oldFilters = changedProperties.get('initialFilters') as FilterFilters | undefined;
      if (JSON.stringify(oldFilters) !== JSON.stringify(this.initialFilters)) {
        this.firstName = this.initialFilters.firstName || '';
        this.lastName = this.initialFilters.lastName || '';
        this.ageMin = this.initialFilters.ageMin || 18;
        this.ageMax = this.initialFilters.ageMax || 65;
        this.addressInput = this.initialFilters.address || '';
        this.addressObj = this.initialFilters.addressObj || null;
        
        this.selectedState = this.initialFilters.state || '';
        await this.updateComplete;
        this.selectedCity = this.initialFilters.city || '';
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._debounceTimer);
  }

  private _handleStateChange(e: Event) {
    this.selectedState = (e.target as HTMLSelectElement).value;
    this.selectedCity = ''; 
  }

  private _handleAddressInput(e: InputEvent) {
    const val = (e.target as HTMLInputElement).value;
    this.addressInput = val;

    clearTimeout(this._debounceTimer);
    this._debounceTimer = window.setTimeout(async () => {
        const trimmed = val.trim();
        if (trimmed.length < 3) {
            this.addressSuggestions = [];
            return;
        }
        try {
            const results = await this._mapboxSearch.suggest(trimmed, { sessionToken: this._sessionToken, country: 'US', limit: 5 });
            this.addressSuggestions = results.suggestions;
        } catch (err) {
            console.error('Mapbox suggest error', err);
            this.addressSuggestions = [];
        }
    }, 300);
  }

  private async _handleSelectSuggestion(suggestion: any) {
    try {
      const retrieve = await this._mapboxSearch.retrieve(suggestion, { sessionToken: this._sessionToken });
      const feature = retrieve.features?.[0];
      this.addressInput = suggestion.full_address ?? suggestion.name;
      this.addressSuggestions = [];
      this.addressObj = feature;
      
      if (feature?.properties) {
        this.selectedState = feature.properties.region_code || '';
        await this.updateComplete;
        this.selectedCity = feature.properties.place || '';
      }

    } catch (err) {
      console.error('Mapbox retrieve error', err);
    }
  }

  private _handleInputBlur() {
    setTimeout(() => { this.addressSuggestions = []; }, 150);
  }

  private _applyFilters(e: Event) {
    e.preventDefault();
    const detail = {
      firstName: this.firstName,
      lastName: this.lastName,
      state: this.selectedState,
      city: this.selectedCity,
      ageMin: this.ageMin,
      ageMax: this.ageMax,
      address: this.addressInput,
      addressObj: this.addressObj
    };
    this.dispatchEvent(new CustomEvent('filters-applied', { detail, bubbles: true, composed: true }));
  }

  render() {
    const isAddressSearch = this.searchType === 'address';
    const cities = CITIES_BY_STATE[this.selectedState] || [];
    
    return html`
      <div class="filter-container">
        <h3 class="title">Refine Your Search</h3>
        <form @submit=${this._applyFilters}>
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input id="firstName" type="text" .value=${this.firstName} @input=${(e: Event) => this.firstName = (e.target as HTMLInputElement).value}>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input id="lastName" type="text" .value=${this.lastName} @input=${(e: Event) => this.lastName = (e.target as HTMLInputElement).value}>
          </div>
          <div class="form-group">
            <label for="state">State</label>
            <select id="state" .value=${this.selectedState} @change=${this._handleStateChange} ?disabled=${isAddressSearch}>
              <option value="">All States</option>
              ${US_STATES.map(st => html`<option value=${st.code}>${st.name}</option>`)}
            </select>
          </div>
          <div class="form-group">
            <label for="city">City</label>
            <select id="city" .value=${this.selectedCity} ?disabled=${!this.selectedState || isAddressSearch} @change=${(e: Event) => this.selectedCity = (e.target as HTMLSelectElement).value}>
              <option value="">All Cities</option>
              ${cities.map(city => html`<option value=${city}>${city}</option>`)}
            </select>
          </div>
          <div class="form-group">
            <label>Filter by Age</label>
            <div class="age-inputs">
              <input type="number" min="18" max="100" .value=${String(this.ageMin)} @input=${(e: Event) => this.ageMin = Number((e.target as HTMLInputElement).value)}>
              <span>to</span>
              <input type="number" min="18" max="100" .value=${String(this.ageMax)} @input=${(e: Event) => this.ageMax = Number((e.target as HTMLInputElement).value)}>
            </div>
          </div>
          <div class="form-group">
            <label for="address">Address</label>
            <input
              id="address"
              type="text"
              .value=${this.addressInput}
              @input=${this._handleAddressInput}
              @blur=${this._handleInputBlur}
              autocomplete="off"
              placeholder="Enter street address"
            />
            ${this.addressSuggestions.length > 0 ? html`
              <ul class="suggestions">
                ${this.addressSuggestions.map(item => html`
                  <li class="suggestion-item" @mousedown=${() => this._handleSelectSuggestion(item)}>
                    ${item.full_address ?? item.name}
                  </li>
                `)}
              </ul>
            ` : ''}
          </div>
          <button type="submit" class="apply-button">Apply Filters</button>
        </form>
      </div>
    `;
  }
}