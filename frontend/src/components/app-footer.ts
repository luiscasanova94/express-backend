import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import mainStyles from '../styles/main.css?inline';

@customElement('app-footer')
export class AppFooter extends LitElement {
  static styles = css`
    ${unsafeCSS(mainStyles)}
    footer {
      background-color: black;
      color: white;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 2rem;
    }

    .footer-logo {
      font-family: 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;
      font-size: 2.5rem;
      color: #eb4538;
      letter-spacing: 0.05em;
    }
    
    .footer-section-title {
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      letter-spacing: 0.05em;
    }

    .footer-link {
      color: #a0aec0;
      text-decoration: none;
      transition: color 0.2s;
      display: block;
      margin-bottom: 0.5rem;
    }

    .footer-link:hover {
      color: #ffffff;
    }

    .social-icon {
      fill: white;
      width: 24px;
      height: 24px;
      transition: fill 0.2s;
    }
    
    .social-icon:hover {
        fill: #eb4538;
    }

    .lang-link {
        color: #a0aec0;
        margin: 0 0.5rem;
        text-decoration: none;
    }
    
    .lang-link:hover {
        color: white;
    }

    .legal-link {
        color: #a0aec0;
        text-decoration: none;
    }
    .legal-link:hover {
        color: white;
    }
  `;

  render() {
    return html`
      <footer>
        <div class="footer-container">
          
          <div class="text-center mb-12">
            <div class="footer-logo mb-2">CHEATERBUSTER</div>
            <p class="text-gray-400 text-sm mb-4">&copy; Cheaterbuster 2016 - 2025</p>
            <div class="mb-6">
              <a href="#" class="lang-link">English</a>
              <a href="#" class="lang-link">Français</a>
              <a href="#" class="lang-link">Português</a>
            </div>
            <div class="flex justify-center space-x-6">
              <a href="#">
                <svg class="social-icon" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.494v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.294h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
              <a href="#">
                <svg class="social-icon" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/></svg>
              </a>
              <a href="#">
                <svg class="social-icon" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>
          
          <div class="grid grid-cols-2 text-center md:text-center mb-12">
            <div>
              <h3 class="footer-section-title uppercase">Main</h3>
              <a href="#" class="footer-link">Search</a>
              <a href="#" class="footer-link">Account</a>
              <a href="#" class="footer-link">Manage Subscriptions</a>
            </div>
            <div>
              <h3 class="footer-section-title uppercase">Resources</h3>
              <a href="#" class="footer-link">About</a>
              <a href="#" class="footer-link">FAQ</a>
              <a href="#" class="footer-link">Affiliates</a>
              <a href="#" class="footer-link">Contact</a>
            </div>
            <div class="hidden md:block"></div>
            <div class="hidden md:block"></div>
          </div>
          
          <div class="text-center text-gray-400">
            <a href="#" class="legal-link">Privacy Policy</a>
            <span class="mx-2">&bull;</span>
            <a href="#" class="legal-link">Terms & Conditions</a>
          </div>
          
        </div>
      </footer>
    `;
  }
}