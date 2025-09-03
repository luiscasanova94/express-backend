import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { authGuard } from './router/auth.guard';
import { authService } from './services/auth.service';
import mainStyles from './styles/main.css?inline';
import './components/app-header';
import './components/app-footer';
import './components/app-sidebar';
import './views/home-view';
import './views/about-view';
import './views/report-view';
import './views/login-view';
import './components/loading-overlay';
import './components/modal-element';
import './views/search-history-view'; 
import './views/search-results-view';
import './views/statistics-view';

@customElement('my-app')
class MyApp extends LitElement {
  @state() private isSidebarOpen = false;
  @state() private isAuthenticated = false; 
  @state() private _currentPath = window.location.pathname;

  // Lista de rutas que no deben mostrar el sidebar principal
  private _fullWidthPaths = ['/login', '/results'];

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #111214;
    }

    .content-wrapper {
      display: flex;
      flex: 1; 
      position: relative;
    }

    app-sidebar {
      width: 250px;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh; 
      align-self: flex-start;
    }

    main {
      flex-grow: 1;
      padding: 16px;
      overflow-y: auto; 
    }
    
    main.full-width {
        width: 100%;
        padding: 0; /* Opcional: remover padding en vistas de ancho completo */
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    @media (max-width: 767px) {
      app-sidebar {
        position: fixed;
        height: 100vh;
        top: 0;
        z-index: 1000;
      }
      main {
        padding: 8px; /* Ajustar padding para móviles */
      }
      
      .sidebar-overlay.open {
        display: block;
        opacity: 1;
      }
    }
    
    ${unsafeCSS(mainStyles)}
  `;

  constructor() {
    super();
    this.addEventListener('toggle-sidebar', this.toggleSidebar);
  }
  
  async connectedCallback() {
    super.connectedCallback();
    window.addEventListener('vaadin-router-location-changed', this.handleLocationChanged);
    await this.handleLocationChanged(); 
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('toggle-sidebar', this.toggleSidebar);
    window.removeEventListener('vaadin-router-location-changed', this.handleLocationChanged);
  }
  
  private handleLocationChanged = async (e?: CustomEvent) => {
    this.isAuthenticated = await authService.isAuthenticated();
    if (e) {
      this._currentPath = e.detail.location.pathname;
    }
  }

  firstUpdated() {
    const outlet = this.shadowRoot?.getElementById('outlet');
    if (outlet) {
      const router = new Router(outlet);
      router.setRoutes([
        {
          path: '/',
          component: 'home-view',
          action: authGuard,
        },
        {
          path: '/results',
          component: 'search-results-view',
          action: authGuard,
        },
        { path: '/login', component: 'login-view' },
        { path: '/about', component: 'about-view' },
        {
          path: '/report/:id',
          component: 'report-view',
          action: authGuard,
        },
        {
          path: '/search-history',
          component: 'search-history-view',
          action: authGuard,
        },
        {
          path: '/statistics',
          component: 'statistics-view',
          action: authGuard,
        },
      ]);
    }
  }

  private toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  render() {
    const showMainSidebar = this.isAuthenticated && !this._fullWidthPaths.some(p => this._currentPath.startsWith(p));

    return html`
      <app-header></app-header>
      
      <div class="content-wrapper">
        ${showMainSidebar ? html`<app-sidebar .open=${this.isSidebarOpen}></app-sidebar>` : ''}
        
        <div class="sidebar-overlay ${this.isSidebarOpen ? 'open' : ''}" @click=${this.toggleSidebar}></div>
        
        <main id="outlet" class="${!showMainSidebar ? 'full-width' : ''}"></main>
      </div>

      <app-footer></app-footer>
    `;
  }
}