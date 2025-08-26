import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PersonService } from '../services/person.service';
import { stateService } from '../services/state.service';
import { searchHistoryService } from '../services/search-history.service';
import '../components/search-form';
import '../components/loading-overlay';
import '../components/modal-element';
import './results-view';
import { Person } from '../interfaces/person.interface.js';

@customElement('home-view')
export class HomeView extends LitElement {
  private personService: PersonService;
  @state() private searchResults: Person[] | null = null;
  @state() private searchQuery: string | any = null;
  @state() private hasSearched = false;

  private _subscription = () => {
    this.searchResults = stateService.persons;
    this.searchQuery = stateService.searchQuery;
    this.requestUpdate();
  };

  constructor() {
    super();
    this.personService = new PersonService({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-TOKEN': import.meta.env.VITE_DATA_AXLE_API_TOKEN,
      },
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.searchResults = stateService.persons;
    this.searchQuery = stateService.searchQuery;

    if (this.searchQuery) {
      this.hasSearched = true;
    }

    stateService.subscribe(this._subscription);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    stateService.unsubscribe(this._subscription);
  }

   async _handleSearch(e: CustomEvent<{ type: string; value: string | any; filters?: any }>) {
    const { type, value, filters } = e.detail;
    stateService.loading = true;
    stateService.error = null;
    stateService.searchQuery = value;
    stateService.searchType = type;
    stateService.persons = []; 
    this.searchQuery = value;
    this.searchResults = []; 
    this.hasSearched = true;

    await this.updateComplete;

    const resultsView = this.querySelector('results-view');
    const resultsTitle = resultsView?.shadowRoot?.querySelector('#results-title');
    if (resultsTitle) {
      resultsTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    try {
      let results: any = []; 
      if (type !== 'phone' && type !== 'address' && type !== 'name' && type !== 'email') {
        throw new Error('Type of search not valid');
      }

      switch (type) {
        case 'phone':
          results = await this.personService.findByPhone(value);
          break;
        case 'address':
          results = await this.personService.findByAddress(value);
          break;
        case 'name':
          results = await this.personService.findByName(value, filters);
          break;
        case 'email':
          results = await this.personService.findByEmail(value);
          break;
      }
      
      if (results.documents && results.documents.length > 0) {
        if (type === 'phone') {
          results.documents.forEach((person: Person) => {
            if (!person.cell_phones) person.cell_phones = [];
            const phoneExists = person.cell_phones.some(p => p.phone === value);
            if (!phoneExists) {
              person.cell_phones.unshift({ phone: value, active: true });
            }
          });
        } else if (type === 'email') {
          results.documents.forEach((person: Person) => {
            if (!person.emails) person.emails = [];
            const emailExists = person.emails.some(e => e.address === value);
            if (!emailExists) {
              person.emails.unshift({ address: value });
            }
          });
        }
      }
      
      const resultType = results.count === 0 ? 'empty' : results.count === 1 ? 'single' : 'set';
      const keyword = typeof value === 'object' ? value.properties?.full_address || JSON.stringify(value) : value;

      const historyData = {
        date: new Date().toISOString(),
        keyword: keyword,
        type: type,
        resultType: resultType,
        response: results,
        state: 'active'
      };

      await searchHistoryService.saveSearch(historyData);

      if (results.count > 0 && results.documents.length > 0) {
        const personsWithInternalId = results.documents.map((person: Person, index: number) => ({
          ...person,
          id: `person_${Date.now()}_${index}` 
        }));

        stateService.persons = personsWithInternalId;

      } else {
        stateService.persons = [];
      }
    } catch (error: any) {
      stateService.error = error.message || 'Search failed. Please try again later.';
    } finally {
      stateService.loading = false;
    }
  }

  render() {
    return html`
      <div class="p-8 flex justify-center">
        <search-form @search-submitted=${this._handleSearch}></search-form>
      </div>

      ${this.hasSearched ? html`
        <results-view 
          .persons=${this.searchResults || []} 
          .searchQuery=${this.searchQuery}
          .searchType=${stateService.searchType}
          ?isLoading=${stateService.loading}
        ></results-view>
      ` : ''}

      <modal-element 
        ?active=${!!stateService.error} 
        .message=${stateService.error || ''}
        @click=${() => stateService.error = null}
      ></modal-element>
    `;
  }

  createRenderRoot() {
    return this;
  }
}