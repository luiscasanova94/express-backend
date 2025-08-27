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
  @state() private recentHistory: SearchHistoryEntry[] = [];
  @state() private _isSubscribed = false;

  private _subscription = () => this.requestUpdate();

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
    if (!this._isSubscribed) {
        stateService.subscribe(this._subscription);
        this._isSubscribed = true;
    }
    
    if (!stateService.newSearchPerformed) {
      await this.fetchRecentHistory();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    stateService.unsubscribe(this._subscription);
    this._isSubscribed = false;
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
    
    stateService.newSearchPerformed = false;
    
    stateService.persons = item.response.documents.map((p: any, i: number) => ({
      ...p,
      id: `person_${Date.now()}_${i}`
    }));
    stateService.searchQuery = item.keyword;
    stateService.searchType = item.type;
    (stateService as any).searchFilters = null;
    stateService.totalResults = item.count;
    stateService.currentPage = 1;
    stateService.limit = 5;
    stateService.sort = item.sort || { first_name: 'asc' };
  }
  
  private async executeSearch(page = 1) {
    stateService.loading = true;
    stateService.currentPage = page;
    const offset = (stateService.currentPage - 1) * stateService.limit;

    try {
      let results: any = [];
      const { searchType, searchQuery, searchFilters, limit, sort } = (stateService as any);

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
      }

      if (stateService.newSearchPerformed && page === 1) {
          const resultType = results.count === 0 ? 'empty' : results.count === 1 ? 'single' : 'set';
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
            page: stateService.currentPage,
            count: results.count
          };
          await searchHistoryService.saveSearch(historyData);
          await this.fetchRecentHistory();
      }
      
      stateService.persons = results.documents.map((p: Person, i: number) => ({...p, id: `person_${Date.now()}_${i}`}));
      stateService.totalResults = results.count;

    } catch (error: any) {
      stateService.error = error.message || 'Search failed.';
    } finally {
      stateService.loading = false;
    }
  }

  async _handleSearch(e: CustomEvent<{ type: string; value: string | any; filters?: any }>) {
    stateService.newSearchPerformed = true;

    const { type, value, filters } = e.detail;
    stateService.loading = true;
    stateService.error = null;
    stateService.searchQuery = value;
    stateService.searchType = type;
    (stateService as any).searchFilters = filters;
    stateService.persons = [];

    stateService.currentPage = 1;
    stateService.limit = 5;
    stateService.sort = { first_name: 'asc' };
    
    await this.updateComplete;
    await this.executeSearch(1);
  }

  private async _handleOptionsChange(e: CustomEvent) {
    const { page, limit, sort } = e.detail;
    if (limit !== undefined) stateService.limit = limit;
    if (sort !== undefined) stateService.sort = sort;
    
    await this.executeSearch(page || stateService.currentPage);
  }

  render() {
    return html`
      <div class="max-w-[800px] mx-auto px-4 md:px-0">
        <div class="py-8 flex justify-center">
            <search-form @search-submitted=${this._handleSearch}></search-form>
        </div>

        ${!stateService.newSearchPerformed && this.recentHistory.length > 0 ? html`
          <recent-searches 
            .history=${this.recentHistory}
            @rerun-search=${this._handleRerunSearch}
          ></recent-searches>
        ` : ''}
      </div>

      ${stateService.searchQuery ? html`
        <results-view 
          .persons=${stateService.persons} 
          .searchQuery=${stateService.searchQuery}
          ?isLoading=${stateService.loading}
          .totalResults=${stateService.totalResults}
          .currentPage=${stateService.currentPage}
          .limit=${stateService.limit}
          .sort=${stateService.sort}
          ?isNewSearch=${stateService.newSearchPerformed}
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