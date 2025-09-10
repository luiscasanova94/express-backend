// frontend/src/components/app-header.ts

import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { authService } from '../services/auth.service';
import { creditsService } from '../services/credits.service';
import mainStyles from '../styles/main.css?inline';

@customElement('app-header')
export class AppHeader extends LitElement {
  @state() private isAuthenticated = false;
  @state() private creditsInfo = {
    used: 0,
    limit: 1000,
    available: 1000
  };

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

    .credits-counter {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 20px;
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #495057;
      margin-left: 1rem;
    }

    .credits-counter.low {
      background-color: #fff3cd;
      border-color: #ffeaa7;
      color: #856404;
    }

    .credits-counter.critical {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
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
      .home-link {
          display: none;
      }
    }

    ${unsafeCSS(mainStyles)}
  `;

  async connectedCallback() {
    super.connectedCallback();
    this.isAuthenticated = await authService.isAuthenticated();
    window.addEventListener('vaadin-router-location-changed', this.handleAuthChange);
    if (this.isAuthenticated) {
      await this.loadCreditsInfo();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('vaadin-router-location-changed', this.handleAuthChange);
  }

  private handleAuthChange = async () => {
    this.isAuthenticated = await authService.isAuthenticated();
    if (this.isAuthenticated) {
      await this.loadCreditsInfo();
    }
  }

  private async loadCreditsInfo() {
    try {
      const creditsCheck = await creditsService.checkCredits(0);
      this.creditsInfo = {
        used: creditsCheck.totalUsed,
        limit: creditsCheck.limit,
        available: creditsCheck.availableCredits
      };
    } catch (error) {
      console.error('Failed to load credits info:', error);
    }
  }

  private getCreditsCounterClass(): string {
    const percentage = (this.creditsInfo.used / this.creditsInfo.limit) * 100;
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'low';
    return '';
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
            <a href="/" class="home-link">Home</a>
            ${this.isAuthenticated
              ? html`
                  <span class="credits-counter ${this.getCreditsCounterClass()}">
                    ${this.creditsInfo.used}/${this.creditsInfo.limit}
                  </span>
                  <button @click=${this.handleLogout}>Logout</button>
                `
              : ''}
          </div>
        </div>
      </nav>
    `;
  }
}