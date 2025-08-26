import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PersonService } from '../services/person.service';
import { stateService } from '../services/state.service';
import { searchHistoryService, SearchHistoryEntry } from '../services/search-history.service';
import '../components/search-form';
import '../components/loading-overlay';
import '../components/modal-element';
import './results-view';
import '../components/recent-searches';
import { Person } from '../interfaces/person.interface.js';

@customElement('home-view')
export class HomeView extends LitElement {
  private personService: PersonService;
  @state() private searchResults: Person[] | null = null;
  @state() private searchQuery: string | any = null;
  @state() private hasSearched = false;
  @state() private newSearchPerformed = false; 
  @state() private totalResults = 0;
  @state() private currentPage = 1;
  @state() private limit = 5;
  @state() private sort: any = { first_name: 'asc' };
  @state() private recentHistory: SearchHistoryEntry[] = [];
  @state() private searchSource: 'manual' | 'widget' = 'manual';

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

  async connectedCallback() {
    super.connectedCallback();
    this.searchResults = stateService.persons;
    this.searchQuery = stateService.searchQuery;

    if (this.searchQuery && this.searchResults && this.searchResults.length > 0) {
      this.hasSearched = true;
    } else {
      await this.fetchRecentHistory();
    }

    stateService.subscribe(this._subscription);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    stateService.unsubscribe(this._subscription);
  }

  async fetchRecentHistory() {
    try {
      const response = await searchHistoryService.getHistory(1, 4);
      this.recentHistory = response.history;
    } catch (error) {
      console.error("Could not fetch recent history", error);
    }
  }

  private _handleRerunSearch(e: CustomEvent<SearchHistoryEntry>) {
    const item = e.detail;
    if (item.resultType === 'empty') return;
    
    this.searchSource = 'widget';

    const results = item.response;
    
    stateService.persons = results.documents.map((p: any, i: number) => ({
      ...p,
      id: `person_${Date.now()}_${i}`
    }));
    stateService.searchQuery = item.keyword;
    stateService.searchType = item.type;
    (stateService as any).searchFilters = null;

    this.totalResults = results.count;
    this.currentPage = item.page || 1;
    this.limit = 5;
    this.sort = item.sort || { first_name: 'asc' };

    this.hasSearched = true;
    this.newSearchPerformed = false;
  }
  
  private async executeSearch(page = 1) {
    stateService.loading = true;
    this.currentPage = page;
    const offset = (this.currentPage - 1) * this.limit;

    try {
      let results: any = [];
      const { searchType, searchQuery, searchFilters } = (stateService as any);

      if (!searchType || !searchQuery) {
          stateService.loading = false;
          return;
      }

      switch (searchType) {
        case 'phone':
          results = await this.personService.findByPhone(searchQuery, this.limit, offset, this.sort);
          break;
        case 'address':
          results = await this.personService.findByAddress(searchQuery, this.limit, offset, this.sort);
          break;
        case 'name':
          results = await this.personService.findByName(searchQuery, searchFilters, this.limit, offset, this.sort);
          break;
        case 'email':
          results = await this.personService.findByEmail(searchQuery, this.limit, offset, this.sort);
          break;
      }

      if (page === 1) {
          const resultType = results.count === 0 ? 'empty' : results.count === 1 ? 'single' : 'set';
          const keyword = typeof searchQuery === 'object' ? searchQuery.properties?.full_address || JSON.stringify(searchQuery) : searchQuery;

          const historyData = {
            date: new Date().toISOString(),
            keyword: keyword,
            type: searchType,
            resultType: resultType,
            response: results,
            state: 'active',
            sort: this.sort,
            offset: offset,
            page: this.currentPage,
            count: results.count
          };
          await searchHistoryService.saveSearch(historyData);
      }

      if (results.count > 0 && results.documents.length > 0) {
        const personsWithInternalId = results.documents.map((person: Person, index: number) => ({
          ...person,
          id: `person_${Date.now()}_${index}` 
        }));
        stateService.persons = personsWithInternalId;
        this.totalResults = results.count;
      } else {
        stateService.persons = [];
        this.totalResults = 0;
      }
    } catch (error: any) {
      stateService.error = error.message || 'Search failed. Please try again later.';
    } finally {
      stateService.loading = false;
    }
  }

  async _handleSearch(e: CustomEvent<{ type: string; value: string | any; filters?: any }>) {
    const { type, value, filters } = e.detail;
    
    this.searchSource = 'manual';
    
    stateService.loading = true;
    stateService.error = null;
    stateService.searchQuery = value;
    stateService.searchType = type;
    (stateService as any).searchFilters = filters;
    stateService.persons = [];
    
    this.hasSearched = true;
    this.newSearchPerformed = true;

    this.currentPage = 1;
    this.limit = 5;
    this.sort = { first_name: 'asc' };
    
    await this.updateComplete;

    const resultsView = this.querySelector('results-view');
    const resultsTitle = resultsView?.shadowRoot?.querySelector('#results-title');
    if (resultsTitle) {
      resultsTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    await this.executeSearch(1);
  }

  private async _handleOptionsChange(e: CustomEvent) {
    const { page, limit, sort } = e.detail;
    if (limit !== undefined) this.limit = limit;
    if (sort !== undefined) this.sort = sort;
    
    await this.executeSearch(page || this.currentPage);
  }

  render() {
    return html`
      <div class="max-w-[800px] mx-auto px-4 md:px-0">
        <div class="py-8 flex justify-center">
            <search-form @search-submitted=${this._handleSearch}></search-form>
        </div>

        ${!this.newSearchPerformed && this.recentHistory.length > 0 ? html`
          <recent-searches 
            .history=${this.recentHistory}
            @rerun-search=${this._handleRerunSearch}
          ></recent-searches>
        ` : ''}
      </div>

      ${this.hasSearched ? html`
        <results-view 
          .persons=${this.searchResults || []} 
          .searchQuery=${this.searchQuery}
          .searchType=${stateService.searchType}
          ?isLoading=${this.loading}
          .totalResults=${this.totalResults}
          .currentPage=${this.currentPage}
          .limit=${this.limit}
          .sort=${this.sort}
          .source=${this.searchSource}
          @options-changed=${this._handleOptionsChange}
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