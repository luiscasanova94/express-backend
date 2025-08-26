import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import mainStyles from '../styles/main.css?inline';

@customElement('app-header')
export class AppHeader extends LitElement {
  static styles = css`
    nav {
            background-color: white;
      padding-top: 1rem;
      padding-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Sombra para que se destaque del fondo */
    }

    .logo-img {
      height: 40px;
      width: auto;
      vertical-align: middle;
    }

    .nav-links a {
            color: #FF2E29;
      text-decoration: none;
      margin-left: 1.5rem;
      font-weight: 500;
    }

    .nav-links a:hover {
      color: #f98368; 
  
    }

    ${unsafeCSS(mainStyles)}
  `;

  render() {
    return html`
      <nav>
        <div class="container mx-auto px-4 flex justify-between items-center">
          <a href="/" class="logo-link">
            <img src="/img/logo.png" alt="Cheaterbuster Logo" class="logo-img" />
          </a>
          <div class="nav-links">
            <a href="/">Menu</a>

          </div>
        </div>
      </nav>
    `;
  }
}