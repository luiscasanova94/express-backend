import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { stateService } from '../services/state.service';
import { PersonService } from '../services/person.service';
import mainStyles from '../styles/main.css?inline';

import '../components/filter-sidebar';
import './results-view';

@customElement('search-results-view')
export class SearchResultsView extends LitElement {
  private personService: PersonService;
  private _subscription = () => this.requestUpdate();

  @state() private initialFilters: any = {};

  static styles = css`
    :host {
      display: block;
      color: white;
    }
    ${unsafeCSS(mainStyles)}
  `;

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
    stateService.subscribe(this._subscription);
    this.prepareInitialFilters();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    stateService.unsubscribe(this._subscription);
  }

  private prepareInitialFilters() {
    const { searchQuery, searchType } = stateService;
    const filters: any = {};
    if (searchType === 'name' && typeof searchQuery === 'string') {
        const nameParts = searchQuery.split(' ');
        filters.firstName = nameParts[0] || '';
        filters.lastName = nameParts.slice(1).join(' ') || '';
    }
    this.initialFilters = filters;
  }

  private async _handleFiltersApplied(e: CustomEvent) {
    stateService.loading = true;
    stateService.error = null;
    
    const filters = e.detail;
    const propositions = [];

    if (filters.firstName) {
        propositions.push({ type: 'predicate', attribute: 'first_name', relation: 'matches', value: filters.firstName });
    }
    if (filters.lastName) {
        propositions.push({ type: 'predicate', attribute: 'last_name', relation: 'matches', value: filters.lastName });
    }
    if (filters.state) {
        propositions.push({ type: 'predicate', attribute: 'state', relation: 'in', value: [filters.state] });
    }
    if (filters.city) {
        propositions.push({ type: 'predicate', attribute: 'city', relation: 'matches', value: filters.city });
    }
    if (filters.ageMin && filters.ageMax) {
        propositions.push({ type: 'predicate', attribute: 'age', relation: 'between', value: [String(filters.ageMin), String(filters.ageMax)] });
    }

    const apiFilters = {
        type: 'connective',
        operator: 'and',
        propositions: propositions
    };
    
    stateService.searchType = 'name';
    stateService.searchQuery = `${filters.firstName} ${filters.lastName}`.trim();
    (stateService as any).searchFilters = apiFilters;
    stateService.currentPage = 1;

    try {
        const results = await this.personService.findByName(stateService.searchQuery, apiFilters, stateService.limit, 0, stateService.sort);
        stateService.persons = results.documents.map((p: any, i: number) => ({...p, id: `person_${Date.now()}_${i}`}));
        stateService.totalResults = results.count;
    } catch (error: any) {
        stateService.error = error.message || 'Refined search failed.';
    } finally {
        stateService.loading = false;
    }
  }

  private async _handleOptionsChange(e: CustomEvent) {
    const { page, limit, sort } = e.detail;
    if (limit !== undefined) stateService.limit = limit;
    if (sort !== undefined) stateService.sort = sort;
    
    stateService.loading = true;
    const offset = ((page || stateService.currentPage) - 1) * stateService.limit;

    try {
        const results = await this.personService.findByName(stateService.searchQuery, (stateService as any).searchFilters, stateService.limit, offset, stateService.sort);
        stateService.persons = results.documents.map((p: any, i: number) => ({...p, id: `person_${Date.now()}_${i}`}));
        stateService.totalResults = results.count;
        stateService.currentPage = page || stateService.currentPage;
    } catch (error: any) {
        stateService.error = error.message || 'Pagination failed.';
    } finally {
        stateService.loading = false;
    }
  }

  render() {
    return html`
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 mb-8">
          <div class="lg:col-span-1">
            <div class="sticky top-8">
              <filter-sidebar 
                .initialFilters=${this.initialFilters}
                @filters-applied=${this._handleFiltersApplied}>
              </filter-sidebar>
            </div>
          </div>
          <div class="lg:col-span-2">
            <results-view
              .persons=${stateService.persons} 
              .searchQuery=${stateService.searchQuery}
              ?isLoading=${stateService.loading}
              .totalResults=${stateService.totalResults}
              .currentPage=${stateService.currentPage}
              .limit=${stateService.limit}
              .sort=${stateService.sort}
              ?isNewSearch=${true}
              @options-changed=${this._handleOptionsChange}
            ></results-view>
          </div>
        </div>
      </div>
    `;
  }

  createRenderRoot() {
    return this;
  }
}