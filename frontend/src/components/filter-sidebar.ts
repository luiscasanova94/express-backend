import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { US_STATES, CITIES_BY_STATE } from '../data/states-cities.data';
import mainStyles from '../styles/main.css?inline';

interface FilterFilters {
  firstName?: string;
  lastName?: string;
  state?: string;
  city?: string;
  ageMin?: number;
  ageMax?: number;
}

@customElement('filter-sidebar')
export class FilterSidebar extends LitElement {
  @property({ type: Object }) initialFilters: FilterFilters = {};

  @state() private firstName = '';
  @state() private lastName = '';
  @state() private selectedState = '';
  @state() private selectedCity = '';
  @state() private ageMin = 18;
  @state() private ageMax = 65;

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
    ${unsafeCSS(mainStyles)}
  `;

  // Se utiliza `updated` para reaccionar a los cambios en las propiedades
  async updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('initialFilters')) {
      const oldFilters = changedProperties.get('initialFilters') as FilterFilters | undefined;
      // Solo actualiza el estado si los filtros realmente han cambiado
      if (JSON.stringify(oldFilters) !== JSON.stringify(this.initialFilters)) {
        this.firstName = this.initialFilters.firstName || '';
        this.lastName = this.initialFilters.lastName || '';
        this.ageMin = this.initialFilters.ageMin || 18;
        this.ageMax = this.initialFilters.ageMax || 65;
        
        // 1. Establece el estado primero para que se actualice la lista de ciudades
        this.selectedState = this.initialFilters.state || '';

        // 2. Espera a que el DOM se actualice con la nueva lista de ciudades
        await this.updateComplete;

        // 3. Ahora que las opciones de ciudad existen, establece la ciudad seleccionada
        this.selectedCity = this.initialFilters.city || '';
      }
    }
  }

  private _handleStateChange(e: Event) {
    this.selectedState = (e.target as HTMLSelectElement).value;
    // Resetea la ciudad cuando el estado cambia para forzar al usuario a re-seleccionar
    this.selectedCity = ''; 
  }

  private _applyFilters(e: Event) {
    e.preventDefault();
    const detail = {
      firstName: this.firstName,
      lastName: this.lastName,
      state: this.selectedState,
      city: this.selectedCity,
      ageMin: this.ageMin,
      ageMax: this.ageMax
    };
    this.dispatchEvent(new CustomEvent('filters-applied', { detail, bubbles: true, composed: true }));
  }

  render() {
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
            <select id="state" .value=${this.selectedState} @change=${this._handleStateChange}>
              <option value="">All States</option>
              ${US_STATES.map(st => html`<option value=${st.code}>${st.name}</option>`)}
            </select>
          </div>
          <div class="form-group">
            <label for="city">City</label>
            <select id="city" .value=${this.selectedCity} ?disabled=${!this.selectedState} @change=${(e: Event) => this.selectedCity = (e.target as HTMLSelectElement).value}>
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
          <button type="submit" class="apply-button">Apply Filters</button>
        </form>
      </div>
    `;
  }
}