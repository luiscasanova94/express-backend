import { LitElement, html, css, unsafeCSS } from 'lit';
import { Router } from '@vaadin/router';
import mainStyles from './styles/main.css?inline';
import './components/app-header';
import './components/app-footer';
import './views/home-view';
import './views/about-view';
import './views/report-view'; 
import './components/loading-overlay';
import './components/modal-element';

class MyApp extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex-grow: 1;
      padding: 16px;
    }
    ${unsafeCSS(mainStyles)}
  `;

  firstUpdated() {
    const outlet = this.shadowRoot?.getElementById('outlet');
    const router = new Router(outlet);
    router.setRoutes([
      { path: '/', component: 'home-view' },
      { path: '/about', component: 'about-view' },
      { path: '/report/:id', component: 'report-view' }, 
    ]);
  }

  render() {
    return html`
      <app-header></app-header>
      <main id="outlet"></main>
      <app-footer></app-footer>
    `;
  }
}

customElements.define('my-app', MyApp);