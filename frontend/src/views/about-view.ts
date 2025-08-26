export class AboutView extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <h1>About Us</h1>
      <p>This is the about page of our application.</p>
    `;
  }
}

customElements.define('about-view', AboutView);