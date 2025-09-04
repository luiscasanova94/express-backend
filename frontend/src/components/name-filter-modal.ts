import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { US_STATES, CITIES_BY_STATE } from '../data/states-cities.data';

@customElement('name-filter-modal')
export class NameFilterModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) searchValue = '';

  @state() private currentStep = 1;
  @state() private selectedState = '';
  @state() private selectedCity = '';
  @state() private ageRange = { min: 18, max: 65 };
  @state() private skipAgeRange = false;

  static styles = css`
    :host {
      display: block;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: #1f2937; 
      color: #f3f4f6; 
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      transform: scale(0.7);
      transition: transform 0.3s ease;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid #374151;
    }

    .modal-overlay.open .modal-content {
      transform: scale(1);
    }

    .modal-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }

    .modal-subtitle {
      color: #9ca3af; 
      font-size: 0.875rem;
    }

    .step-indicator {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .step {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      margin: 0 0.5rem;
      transition: all 0.3s ease;
    }

    .step.active {
      background-color: #eb4538;
      color: white;
    }

    .step.completed {
      background-color: #10b981;
      color: white;
    }

    .step.pending {
      background-color: #374151; 
      color: #9ca3af;
    }

    .step-connector {
      width: 2rem;
      height: 2px;
      background-color: #374151;
      margin: auto 0;
      transition: background-color 0.3s ease;
    }

    .step-connector.completed {
      background-color: #10b981;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-weight: 500;
      color: #d1d5db; 
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-select, .age-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #4b5563;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      background-color: #374151;
      color: white;
    }

    .form-select:focus, .age-input:focus {
      outline: none;
      border-color: #eb4538;
      box-shadow: 0 0 0 3px rgba(235, 69, 56, 0.2);
    }
    
    .age-range-container {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .age-input {
      text-align: center;
    }

    .age-separator {
      color: #9ca3af;
      font-weight: 500;
    }

    .button-container {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
      text-transform: uppercase;
    }

    .btn-primary {
      background-color: #eb4538;
      color: white;
    }

    .btn-primary:hover {
      background-color: #dc2626;
    }

    .btn-secondary {
      background-color: #4b5563;
      color: #f3f4f6;
    }

    .btn-secondary:hover {
      background-color: #6b7280;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .search-summary {
      background-color: #374151;
      border: 1px solid #4b5563;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-title {
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }

    .summary-item {
      color: #d1d5db;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .skip-link {
      color: #9ca3af;
      text-decoration: underline;
      font-size: 0.875rem;
      cursor: pointer;
      text-align: center;
      margin-top: 1rem;
      transition: color 0.3s ease;
    }

    .skip-link:hover {
      color: #eb4538;
    }
  `;

  private getStepStatus(step: number) {
    if (step < this.currentStep) return 'completed';
    if (step === this.currentStep) return 'active';
    return 'pending';
  }

  private getCitiesForState(stateCode: string): string[] {
    return CITIES_BY_STATE[stateCode] || [];
  }

  private handleStateChange(e: Event) {
    this.selectedState = (e.target as HTMLSelectElement).value;
    this.selectedCity = '';
  }

  private handleCityChange(e: Event) {
    this.selectedCity = (e.target as HTMLSelectElement).value;
  }

  private handleAgeChange(e: Event, type: 'min' | 'max') {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (type === 'min') {
      this.ageRange.min = Math.min(value, this.ageRange.max);
    } else {
      this.ageRange.max = Math.max(value, this.ageRange.min);
    }
  }

  private handleContinue() {
    if (this.currentStep === 1 && !this.selectedState) return;
    if (this.currentStep === 2 && !this.selectedCity) return;
    
    if (this.currentStep < 3) {
      this.currentStep++;
    } else {
      this.submitFilters();
    }
  }

  private handleSkipAgeRange() {
    this.skipAgeRange = true;
    this.submitFilters();
  }

  private handleBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private handleClose() {
    this.open = false;
    this.currentStep = 1;
    this.selectedState = '';
    this.selectedCity = '';
    this.ageRange = { min: 18, max: 65 };
    this.skipAgeRange = false;

    const event = new CustomEvent('modal-closed', {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private submitFilters() {
    const propositions = [
      {
        type: 'predicate',
        attribute: 'state',
        relation: 'in',
        value: [this.selectedState],
        negated: false
      },
      {
        type: 'predicate',
        attribute: 'city',
        relation: 'matches',
        value: this.selectedCity,
        negated: false
      }
    ];

   
    if (!this.skipAgeRange) {
      propositions.push({
        type: 'predicate',
        attribute: 'age',
        relation: 'between',
        value: [this.ageRange.min.toString(), this.ageRange.max.toString()],
        negated: false
      });
    }

    const filters = {
      type: 'connective',
      operator: 'and',
      propositions: propositions
    };

    const event = new CustomEvent('filters-submitted', {
      detail: {
        searchValue: this.searchValue,
        filters: filters,
        skipAgeRange: this.skipAgeRange
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
    this.handleClose();
  }

  render() {
    return html`
      <div class="modal-overlay ${this.open ? 'open' : ''}" @click=${this.handleClose}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h2 class="modal-title">Refine Search by Name</h2>
            <p class="modal-subtitle">Add filters for more accurate results</p>
          </div>

          <div class="step-indicator">
            <div class="step ${this.getStepStatus(1)}">1</div>
            <div class="step-connector ${this.getStepStatus(1) === 'completed' ? 'completed' : ''}"></div>
            <div class="step ${this.getStepStatus(2)}">2</div>
            <div class="step-connector ${this.getStepStatus(2) === 'completed' ? 'completed' : ''}"></div>
            <div class="step ${this.getStepStatus(3)}">3</div>
          </div>

          ${this.currentStep === 1 ? html`
            <div class="form-group">
              <label class="form-label">Select a state</label>
              <select class="form-select" @change=${this.handleStateChange} .value=${this.selectedState}>
                <option value="">Select a state...</option>
                ${US_STATES.map(state => html`
                  <option value="${state.code}">${state.name}</option>
                `)}
              </select>
            </div>
          ` : ''}

          ${this.currentStep === 2 ? html`
            <div class="form-group">
              <label class="form-label">Select a city</label>
              <select class="form-select" @change=${this.handleCityChange} .value=${this.selectedCity}>
                <option value="">Select a city...</option>
                ${this.getCitiesForState(this.selectedState).map(city => html`
                  <option value="${city}">${city}</option>
                `)}
              </select>
            </div>
          ` : ''}

          ${this.currentStep === 3 ? html`
            <div class="form-group">
              <label class="form-label">Age Range</label>
              <div class="age-range-container">
                <input 
                  type="number" 
                  class="age-input" 
                  min="18" 
                  max="100" 
                  .value=${this.ageRange.min}
                  @input=${(e: Event) => this.handleAgeChange(e, 'min')}
                >
                <span class="age-separator">to</span>
                <input 
                  type="number" 
                  class="age-input" 
                  min="18" 
                  max="100" 
                  .value=${this.ageRange.max}
                  @input=${(e: Event) => this.handleAgeChange(e, 'max')}
                >
                <span class="age-separator">years</span>
              </div>
            </div>

            
            <div class="skip-link" @click=${this.handleSkipAgeRange}>
              Skip age range (optional)
            </div>
          ` : ''}

          <div class="button-container">
            ${this.currentStep > 1 ? html`
              <button class="btn btn-secondary" @click=${this.handleBack}>
                Back
              </button>
            ` : ''}
            <button 
              class="btn btn-primary" 
              @click=${this.handleContinue}
              ?disabled=${(this.currentStep === 1 && !this.selectedState) || (this.currentStep === 2 && !this.selectedCity)}
            >
              ${this.currentStep === 3 ? 'Search' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}