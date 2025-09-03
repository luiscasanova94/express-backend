import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { stateService } from '../services/state.service';
import { PersonService } from '../services/person.service';
import mainStyles from '../styles/main.css?inline';
import { searchHistoryService } from '../services/search-history.service';
import { Person } from '../interfaces/person.interface';

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
    const { searchQuery, searchType, searchFilters } = stateService;
    const filters: any = {};

    if (searchType === 'name' && typeof searchQuery === 'string') {
        const nameParts = searchQuery.split(' ');
        filters.firstName = nameParts[0] || '';
        filters.lastName = nameParts.slice(1).join(' ') || '';
    }
    
    if(searchFilters?.propositions) {
        searchFilters.propositions.forEach((p: any) => {
            if(p.attribute === 'state') filters.state = p.value[0];
            if(p.attribute === 'city') filters.city = p.value;
            if(p.attribute === 'age' && Array.isArray(p.value)) {
                filters.ageMin = p.value[0];
                filters.ageMax = p.value[1];
            }
        });
    }

    this.initialFilters = filters;
  }
  
  private async executeSearch(page: number, saveToHistory: boolean) {
    stateService.loading = true;
    const offset = (page - 1) * stateService.limit;

    try {
      let results: any;
      const { searchType, searchQuery, searchFilters, limit, sort } = stateService;

      switch (searchType) {
        case 'phone':
          results = await this.personService.findByPhone(searchQuery, limit, offset, sort);
          break;
        case 'address':
          results = await this.personService.findByAddress(searchQuery, limit, offset, sort);
          break;
        case 'name':
          results = await this.personService.findByName(searchQuery, searchFilters, limit, offset, sort);
          break;
        case 'email':
          results = await this.personService.findByEmail(searchQuery, limit, offset, sort);
          break;
        default:
          throw new Error('Invalid search type');
      }

      if (saveToHistory) {
        const resultType = results.count === 0 ? 'empty' : 'set';
        const keyword = typeof searchQuery === 'object' ? searchQuery.properties?.full_address || JSON.stringify(searchQuery) : searchQuery;
        const historyData = {
          date: new Date().toISOString(),
          keyword: keyword,
          type: searchType,
          resultType: resultType,
          response: results,
          state: 'active',
          sort: stateService.sort,
          offset: offset,
          page: page,
          count: results.count,
          filters: searchFilters
        };
        await searchHistoryService.saveSearch(historyData);
      }

      stateService.persons = results.documents.map((p: Person, i: number) => ({...p, id: `person_${Date.now()}_${i}`}));
      stateService.totalResults = results.count;
      stateService.currentPage = page;

    } catch (error: any) {
      stateService.error = error.message || 'Search failed.';
    } finally {
      stateService.loading = false;
    }
  }

  private async _handleFiltersApplied(e: CustomEvent) {
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
    stateService.searchFilters = apiFilters;
    stateService.currentPage = 1;

    await this.executeSearch(1, true);
  }

  private async _handleOptionsChange(e: CustomEvent) {
    const { page, limit, sort } = e.detail;
    if (limit !== undefined) stateService.limit = limit;
    if (sort !== undefined) stateService.sort = sort;
    
    const newPage = page || stateService.currentPage;
    await this.executeSearch(newPage, true);
  }

  render() {
    return html`
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8 mb-8">
          <div class="lg:col-span-1">
            <div class="sticky top-8">
              <filter-sidebar 
                .initialFilters=${this.initialFilters}
                @filters-applied=${this._handleFiltersApplied}>
              </filter-sidebar>
            </div>
          </div>
          <div class="lg:col-span-3">
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