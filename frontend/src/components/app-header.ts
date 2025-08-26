// frontend/src/components/app-header.ts

import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { authService } from '../services/auth.service';
import mainStyles from '../styles/main.css?inline';

@customElement('app-header')
export class AppHeader extends LitElement {
  @state() private isAuthenticated = false;

  static styles = css`
    nav {
      background-color: white;
      padding-top: 1rem;
      padding-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 50;
    }

    .logo-img {
      height: 40px;
      width: auto;
      vertical-align: middle;
    }

    .nav-links a, .nav-links button {
      color: #FF2E29;
      text-decoration: none;
      margin-left: 1.5rem;
      font-weight: 500;
      background: none;
      border: none;
      cursor: pointer;
    }

    .nav-links a:hover, .nav-links button:hover {
      color: #f98368;
    }
    
    .hamburger-button {
      display: none; 
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
    }
    
    .hamburger-button svg {
        width: 30px;
        height: 30px;
        stroke: #eb4538;
    }

    @media (max-width: 767px) {
      .hamburger-button {
        display: block;
      }
      .nav-links {
          display: none;
      }
    }

    ${unsafeCSS(mainStyles)}
  `;

  async connectedCallback() {
    super.connectedCallback();
    this.isAuthenticated = await authService.isAuthenticated();
    window.addEventListener('vaadin-router-location-changed', this.handleAuthChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('vaadin-router-location-changed', this.handleAuthChange);
  }

  private handleAuthChange = async () => {
    this.isAuthenticated = await authService.isAuthenticated();
  }

  private async handleLogout() {
    await authService.logout();
    Router.go('/login');
  }
  
  private toggleSidebar() {
    const event = new CustomEvent('toggle-sidebar', {
        bubbles: true,
        composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <nav>
        <div class="container mx-auto px-4 flex justify-between items-center">
          <div class="flex items-center">
            <button class="hamburger-button" @click=${this.toggleSidebar}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <a href="/" class="logo-link ml-2 md:ml-0">
              <img src="/img/logo.png" alt="Cheaterbuster Logo" class="logo-img" />
            </a>
          </div>
          <div class="nav-links">
            <a href="/">Home</a>
            ${this.isAuthenticated
              ? html`<button @click=${this.handleLogout}>Logout</button>`
              : ''}
          </div>
        </div>
      </nav>
    `;
  }
}