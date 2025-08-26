// frontend/src/my-app.ts

import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { authGuard } from './router/auth.guard';
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

@customElement('my-app')
class MyApp extends LitElement {
  @state() private isSidebarOpen = false;

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

    main {
      flex-grow: 1;
      padding: 16px;
      overflow-y: auto;
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

    /* Estilos para móviles */
    @media (max-width: 767px) {
      app-sidebar {
        display: none; /* Ocultar sidebar estática en móvil */
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
  
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('toggle-sidebar', this.toggleSidebar);
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
        { path: '/login', component: 'login-view' },
        { path: '/about', component: 'about-view' },
        {
          path: '/report/:id',
          component: 'report-view',
          action: authGuard,
        },
      ]);
    }
  }

  private toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  render() {
    return html`
      <app-header></app-header>
      <div class="content-wrapper">
        <app-sidebar .open=${this.isSidebarOpen}></app-sidebar>
        <div class="sidebar-overlay ${this.isSidebarOpen ? 'open' : ''}" @click=${this.toggleSidebar}></div>
        <main id="outlet"></main>
      </div>
      <app-footer></app-footer>
    `;
  }
}