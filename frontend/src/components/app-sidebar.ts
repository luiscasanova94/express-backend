import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

@customElement('app-sidebar')
export class AppSidebar extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;
  
  @state() private _currentPath = window.location.pathname;

  static styles = css`
    :host {
      background-color: #1a1a1a;
      color: white;
      transition: transform 0.3s ease-in-out;
      border-right: 1px solid #444;
      flex-shrink: 0;
      width: 250px;
    }

    .sidebar-content {
      padding: 1.5rem 1rem;
    }

    .menu-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .menu-item a {
      display: flex;
      align-items: center;
      padding: 0.875rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: #d1d5db;
      transition: background-color 0.2s ease, color 0.2s ease;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .menu-item a:hover {
      background-color: #374151;
      color: white;
    }

    .menu-item a.active {
      background-color: #eb4538;
      color: white;
      font-weight: 600;
    }

    .menu-item svg {
      margin-right: 0.75rem;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    /* Estilos para móviles */
    @media (max-width: 767px) {
      :host {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 1000;
        transform: translateX(-100%);
      }

      :host([open]) {
        transform: translateX(0);
      }
    }
  `;

  private handleLocationChanged = (e: CustomEvent) => {
    this._currentPath = e.detail.location.pathname;
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(
      'vaadin-router-location-changed',
      this.handleLocationChanged
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      'vaadin-router-location-changed',
      this.handleLocationChanged
    );
  }
  
  render() {
    return html`
      <div class="sidebar-content">
        <ul class="menu-list">
          <li class="menu-item">
            <a href="/" class="${this._currentPath === '/' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span>Search</span>
            </a>
          </li>
          <li class="menu-item">
            <a href="/search-history" class="${this._currentPath === '/search-history' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Search History</span>
            </a>
          </li>
          <li class="menu-item">
            <a href="/statistics" class="${this._currentPath === '/statistics' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span>Statistics</span>
            </a>
          </li>
        </ul>
      </div>
    `;
  }
}