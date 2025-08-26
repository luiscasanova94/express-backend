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

  render() {
    return html`
      <nav>
        <div class="container mx-auto px-4 flex justify-between items-center">
          <a href="/" class="logo-link">
            <img src="/img/logo.png" alt="Cheaterbuster Logo" class="logo-img" />
          </a>
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