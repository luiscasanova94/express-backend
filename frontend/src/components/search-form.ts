import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import mainStyles from '../styles/main.css?inline';
import { isValidPhoneNumber } from 'libphonenumber-js';
import IMask from 'imask';
import { AddressAutofillCore, SessionToken } from '@mapbox/search-js-core';
import './name-filter-modal';

const searchOptions = [
  { id: 'name', label: 'Name', icon: html`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>` },
  { id: 'email', label: 'Email', icon: html`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>` },
  { id: 'phone', label: 'Phone', icon: html`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.759a11.03 11.03 0 006.354 6.354l.759-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>` },
  { id: 'address', label: 'Address', icon: html`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>` },
];

@customElement('search-form')
export class SearchForm extends LitElement {
  @property({ type: String }) searchType: string = 'name';
  @state() private validationError: string = '';
  @state() private addressSuggestions: any[] = [];
  @state() private addressInput: string = '';
  @state() private addressObj: any = null;
  @state() private showNameFilterModal = false;
  @query('#search-input') private _inputElement!: HTMLInputElement;

  private _mask: any = null;
  private _mapboxSearch = new AddressAutofillCore({ accessToken: import.meta.env.VITE_MAPBOX_API_TOKEN });
  private _sessionToken = new SessionToken();
  private _debounceTimer: number | undefined;

  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }
    .error-message {
      color: #fff;
      font-size: 0.875em;
      margin-top: 0.5rem;
    }
    .suggestions {
      background-color: white;
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

  firstUpdated() {
    this._applyOrDestroyMask();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._destroyMask();
    clearTimeout(this._debounceTimer);
  }

  private _applyOrDestroyMask() {
    this._destroyMask();
    if (this.searchType === 'phone' && this._inputElement) {
      const phoneMaskOptions = {
        mask: '(000) 000-0000',
        prepare: (str: string) => {
          if (str.startsWith('+1')) return str.substring(2);
          if (str.startsWith('1') && str.length > 1) return str.substring(1);
          return str;
        },
      };
      this._mask = IMask(this._inputElement, phoneMaskOptions);
    } else if (this.searchType === 'email' && this._inputElement) {
      this._mask = IMask(this._inputElement, {
        mask: /^\S*@?\S*$/,
      });
    }
  }

  private _destroyMask() {
    if (this._mask) {
      this._mask.destroy();
      this._mask = null;
    }
  }

  private _validateInput(type: string, value: string): boolean {
    if (type === 'phone' && !isValidPhoneNumber(value, 'US')) {
      this.validationError = 'Please enter a valid U.S. phone number.';
      return false;
    }
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.validationError = 'Please enter a valid email address.';
        return false;
      }
    }
    this.validationError = '';
    return true;
  }

  async _handleTypeChange(newType: string) {
    this.searchType = newType;
    this.validationError = '';
    this.addressSuggestions = [];
    this.addressInput = '';

    if (this._inputElement) {
      this._inputElement.value = '';
    }

    await this.updateComplete;
    this._applyOrDestroyMask();
    this._inputElement.focus();
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
            const results = await this._mapboxSearch.suggest(trimmed, {
                sessionToken: this._sessionToken,
                country: 'US',
                limit: 5
            });
            this.addressSuggestions = results.suggestions;
        } catch (err) {
            console.error('Mapbox suggest error', err);
            this.addressSuggestions = [];
        }
    }, 300);
}

  private async _handleSelectSuggestion(suggestion: any) {
    try {
      const retrieve = await this._mapboxSearch.retrieve(suggestion, {
        sessionToken: this._sessionToken
      });
      const feature = retrieve.features?.[0];
      this.addressInput = suggestion.full_address ?? suggestion.name;
      this.addressSuggestions = [];
      console.log('Address selected JSON:', feature);
      this.addressObj = feature;
    } catch (err) {
      console.error('Mapbox retrieve error', err);
    }
  }

  private _handleInputChange(e: InputEvent) {
    if (this.validationError) this.validationError = '';
    if (this.searchType === 'address') {
        this._handleAddressInput(e);
    }
  }

  private _handleInputBlur() {
    setTimeout(() => {
        this.addressSuggestions = [];
    }, 150);
  }

  _handleSearchClick() {
    const value = this.searchType === 'address' ? this.addressObj : (this._mask ? this._mask.unmaskedValue : (this._inputElement?.value || '').trim());
    if (!value) {
      this.validationError = 'Please enter a value to search.';
      return;
    }
    if (!this._validateInput(this.searchType, value)) return;
    
    if (this.searchType === 'name') {
      this.showNameFilterModal = true;
    } else {
      const event = new CustomEvent('search-submitted', {
        detail: { type: this.searchType, value },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  private _handleFiltersSubmitted(e: CustomEvent) {
    const { searchValue, filters } = e.detail;
    const event = new CustomEvent('search-submitted', {
      detail: { type: 'name', value: searchValue, filters },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _handleModalClose() {
    this.showNameFilterModal = false;
  }

  render() {
    return html`
      <div style="background-color: #eb4538;" class="p-12 rounded-lg shadow-sm">
        <div class="text-center text-white font-semibold mb-4">
          <h1 class="text-5xl py-3 uppercase font-normal">Is Your Date <span class="font-bold">Hiding</span> Something?</h1>
          <h3>Just select, type, and search — it’s that simple</h3>
        </div>

        <div class="flex flex-wrap justify-left gap-2 mb-4 mt-5">
          ${searchOptions.map(option => {
            const isActive = this.searchType === option.id;
            const classes = {
              'flex': true, 'items-center': true, 'justify-center': true,
              'px-4': true, 'py-2': true, 'rounded-full': true, 'cursor-pointer': true,
              'transition-all': true, 'duration-200': true,
              'bg-red-700': isActive, 'text-white': isActive, 'shadow-md': isActive, 'border-transparent': isActive,
              'bg-white': !isActive, 'text-red-700': !isActive, 'border': !isActive, 'border-red-300': !isActive, 'hover:bg-red-100': !isActive,
            };
            return html`
              <button @click=${() => this._handleTypeChange(option.id)} class=${classMap(classes)}>
                ${option.icon}
                <span>${option.label}</span>
              </button>
            `;
          })}
        </div>

        <div class="flex flex-col sm:flex-row gap-4 items-start">
            <div class="relative w-full">
                <input
                    type="text"
                    id="search-input"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-white placeholder-gray-300"
                    .value=${this.searchType === 'address' ? this.addressInput : ''}
                    placeholder=${this.searchType === 'phone' ? '(123) 456-7890' : `Enter ${this.searchType} here`}
                    @input=${this._handleInputChange}
                    @blur=${this._handleInputBlur}
                    autocomplete="off"
                >
                ${this.searchType === 'address' && this.addressSuggestions.length > 0 ? html`
                    <ul class="suggestions">
                    ${this.addressSuggestions.map(item => html`
                        <li class="suggestion-item" @mousedown=${() => this._handleSelectSuggestion(item)}>
                        ${item.full_address ?? item.name}
                        </li>
                    `)}
                    </ul>
                ` : ''}
            </div>
            <button @click=${this._handleSearchClick} class="w-full sm:w-auto flex-shrink-0 bg-white text-gray-800 font-semibold py-3 px-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm cursor-pointer">
                <span>Get Results</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>

        ${this.validationError ? html`<div class="error-message text-white">${this.validationError}</div>` : ''}
      </div>

      <name-filter-modal 
        .open=${this.showNameFilterModal}
        .searchValue=${this.searchType === 'name' ? (this._mask ? this._mask.unmaskedValue : (this._inputElement?.value || '').trim()) : ''}
        @filters-submitted=${this._handleFiltersSubmitted}
        @modal-closed=${this._handleModalClose}
      ></name-filter-modal>
    `;
  }
}