import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { authService } from '../services/auth.service';
import mainStyles from '../styles/main.css?inline';

@customElement('login-view')
export class LoginView extends LitElement {
  @state() private email = '';
  @state() private password = '';
  @state() private error = '';
  @state() private loading = false;

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #1a1a1a;
    }

    .login-container {
      background-color: #eb4538;
      padding: 2rem;
      border-radius: 0.5rem;
      width: 100%;
      max-width: 400px;
      text-align: center;
    }

    .login-box {
      background-color: black;
      padding: 2.5rem;
      border-radius: 0.5rem;
      position: relative;
    }

    .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }

    h2 {
      color: white;
      margin-bottom: 2rem;
      font-weight: bold;
      font-size: 2rem;
    }

    .input-group {
      margin-bottom: 1.5rem;
      text-align: left;
    }

    label {
      display: block;
      color: #d1d5db;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: bold;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      background-color: #374151;
      border: 1px solid #4b5563;
      border-radius: 0.25rem;
      color: white;
    }

    .login-button {
      width: 100%;
      padding: 0.75rem;
      background-color: white;
      color: black;
      border: none;
      border-radius: 0.25rem;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      margin-top: 1rem;
    }

    .new-customer-link {
      display: block;
      margin-top: 1.5rem;
      color: white;
      text-decoration: none;
    }

    .error {
      color: #f87171;
      margin-top: 1rem;
    }
    ${unsafeCSS(mainStyles)}
  `;

  async firstUpdated() {
    if (await authService.isAuthenticated()) {
      Router.go('/');
    }
  }

  private async handleLogin(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password.';
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      await authService.login(this.email, this.password);
      Router.go('/');
    } catch (error) {
      this.error = 'Invalid credentials. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="login-container">
        <div class="login-box">
          <button class="close-button">&times;</button>
          <h2>LOG IN</h2>
          <form @submit=${this.handleLogin}>
            <div class="input-group">
              <label for="email">USERNAME</label>
              <input
                id="email"
                type="text"
                .value=${this.email}
                @input=${(e: Event) => this.email = (e.target as HTMLInputElement).value}
                placeholder="Username"
              />
            </div>
            <div class="input-group">
              <label for="password">PASSWORD</label>
              <input
                id="password"
                type="password"
                .value=${this.password}
                @input=${(e: Event) => this.password = (e.target as HTMLInputElement).value}
                placeholder="Password"
              />
            </div>
            <button class="login-button" type="submit" ?disabled=${this.loading}>
              ${this.loading ? 'Logging in...' : 'Log in'}
            </button>
            ${this.error ? html`<p class="error">${this.error}</p>` : ''}
          </form>
          
        </div>
      </div>
    `;
  }
}