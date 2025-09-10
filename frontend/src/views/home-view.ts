import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PersonService } from '../services/person.service';
import { stateService } from '../services/state.service';
import { searchHistoryService, SearchHistoryEntry } from '../services/search-history.service';
import { creditsService } from '../services/credits.service';
import { Router } from '@vaadin/router';
import '../components/search-form';
import '../components/loading-overlay';
import '../components/modal-element';
import '../components/searching-modal';
import '../components/credits-alert-modal';
import './results-view';
import '../components/recent-searches';
import { Person } from '../interfaces/person.interface.js';
import { breadcrumbService } from '../services/breadcrumb.service';

@customElement('home-view')
export class HomeView extends LitElement {
  private personService: PersonService;
  @state() private recentHistory: SearchHistoryEntry[] = [];
  @state() private _isSubscribed = false;
  @state() private showCreditsAlert = false;
  @state() private creditsInfo = {
    availableCredits: 0,
    totalUsed: 0,
    limit: 0
  };

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
    breadcrumbService.reset();
    if (!this._isSubscribed) {
        stateService.subscribe(this._subscription);
        this._isSubscribed = true;
    }
    
    await this.fetchRecentHistory();
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
    
    const persons = item.response.documents.map((p: any, i: number) => ({
      ...p,
      id: `person_${Date.now()}_${i}`
    }));

    stateService.persons = persons;
    stateService.searchQuery = item.keyword;
    stateService.searchType = item.type;
    stateService.searchFilters = item.filters || null;
    stateService.totalResults = item.count;
    stateService.currentPage = item.page || 1;
    stateService.limit = 5;
    stateService.sort = item.sort || { first_name: 'asc' };

    if (item.resultType === 'single' && persons.length > 0) {
      Router.go(`/report/${persons[0].id}`);
    } else {
      Router.go('/results');
    }
  }
  
  private async executeSearch(page = 1) {
    stateService.loading = true;
    stateService.currentPage = page;
    const offset = (stateService.currentPage - 1) * stateService.limit;

    try {
      // Verificar créditos disponibles antes de hacer la búsqueda
      if (stateService.newSearchPerformed) {
        const creditsCheck = await creditsService.checkCredits(1); // Verificar al menos 1 crédito
        
        if (!creditsCheck.available) {
          // Mostrar modal de alerta en lugar de lanzar error
          this.creditsInfo = {
            availableCredits: creditsCheck.availableCredits,
            totalUsed: creditsCheck.totalUsed,
            limit: creditsCheck.limit
          };
          this.showCreditsAlert = true;
          stateService.loading = false;
          return; // Salir de la función sin hacer la búsqueda
        }
      }

      let results: any = [];
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
      }

      if (results.documents) {
        results.documents.forEach((person: Person) => {
          if (searchType === 'phone') {
            const phoneExists = person.cell_phones?.some(phone => phone.phone === searchQuery);
            if (!phoneExists) {
              if (!person.cell_phones) {
                person.cell_phones = [];
              }
              person.cell_phones.push({ phone: searchQuery });
            }
          } else if (searchType === 'email') {
            const emailExists = person.emails?.some(email => email.address === searchQuery);
            if (!emailExists) {
              if (!person.emails) {
                person.emails = [];
              }
              person.emails.push({ address: searchQuery });
            }
          }
        });
      }
 
      if (stateService.newSearchPerformed) {
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
            count: results.count,
            filters: searchFilters
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

  async _handleSearch(e: CustomEvent<{ type: string; value: string | any; filters?: any; skipAgeRange?: boolean }>) {
    stateService.newSearchPerformed = true;

    const { type, value, filters, skipAgeRange } = e.detail;
    stateService.loading = true;
    stateService.error = null;
    stateService.searchQuery = value;
    stateService.searchType = type;
    stateService.searchFilters = filters;
    stateService.skipAgeRange = skipAgeRange || false;
    stateService.persons = [];
    stateService.totalResults = 0;
    
    stateService.currentPage = 1;
    stateService.limit = 5;
    stateService.sort = { first_name: 'asc' };
    
    await this.executeSearch(1);
    
    if (stateService.error) {
      return;
    }

    const { searchType, totalResults, persons } = stateService;

    if (searchType === 'name' || searchType === 'address') {
      Router.go('/results');
    } else if (searchType === 'phone' || searchType === 'email') {
      if (totalResults === 1 && persons[0]) {
        Router.go(`/report/${persons[0].id}`);
      } else if (totalResults > 1) {
        Router.go('/results');
      } else {
        stateService.error = `No results found for the ${searchType} you entered.`;
      }
    }
  }

  private _handleCreditsModalClose() {
    console.log('_handleCreditsModalClose called');
    this.showCreditsAlert = false;
  }

  private _handleNavigateToStatistics() {
    this.showCreditsAlert = false;
    Router.go('/statistics');
  }

  render() {
    return html`
      <div class="max-w-[800px] mx-auto px-4 md:px-0">
        <div class="py-8 flex justify-center">
            <search-form @search-submitted=${this._handleSearch}></search-form>
        </div>

        <recent-searches 
          .history=${this.recentHistory}
          @rerun-search=${this._handleRerunSearch}
        ></recent-searches>
      </div>
      
      <modal-element 
        ?active=${!!stateService.error} 
        .message=${stateService.error || ''}
      ></modal-element>

      <searching-modal ?active=${stateService.loading}></searching-modal>
      
      <credits-alert-modal 
        ?isOpen=${this.showCreditsAlert}
        .availableCredits=${this.creditsInfo.availableCredits}
        .totalUsed=${this.creditsInfo.totalUsed}
        .limit=${this.creditsInfo.limit}
        @modal-closed=${this._handleCreditsModalClose}
        @navigate-to-statistics=${this._handleNavigateToStatistics}
      ></credits-alert-modal>
    `;
  }

  createRenderRoot() {
    return this;
  }
}