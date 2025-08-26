import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Person, Email, CellPhone } from '../interfaces/person.interface'; 
import { stateService } from '../services/state.service';
import { personApiFields } from '../config/api-fields.config';
import { PersonApiField } from '../interfaces/api-fields.interface';
import { RouterLocation } from '@vaadin/router';

@customElement('person-report')
export class PersonReport extends LitElement {
  @property({ attribute: false })
  location!: RouterLocation;

  @state() private person: Person | null = null;

  connectedCallback() {
    super.connectedCallback();
    window.scrollTo(0, 0);
    const personId = this.location.params.id as string;
    if (personId) {
      this.person = stateService.persons.find(p => p.id === personId) || null;
    }
  }

  static styles = css`
   
    :host { display: block; padding: 2rem; font-family: sans-serif; }
    .report-container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
    p { color: #555; margin-bottom: 0.5rem; }
    .nested-container { margin-top: 1rem; margin-bottom: 1rem; border-left: 3px solid #e0e0e0; padding-left: 1rem; }
    h3 { margin-bottom: 0.5rem; color: #444; font-size: 1.1rem; }
    .nested-item { background-color: #fff; border: 1px solid #eee; border-radius: 4px; padding: 0.75rem; margin-bottom: 0.5rem; }
    .back-button { background-color: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem; transition: background-color 0.3s; margin-top: 1.5rem; }
    .back-button:hover { background-color: #5a6268; }
  `;

  _goBack() {
    window.history.back();
  }

  
  private renderSimpleField(label: string, value: any) {
    if (value === undefined || value === null || value === '') return '';
    return html`<p><strong>${label}:</strong> ${value}</p>`;
  }

  private isGroup(field: PersonApiField): field is { title: string; children: PersonApiField[] } {
    return (field as any).children && Array.isArray((field as any).children);
  }

  private renderGeneralLeaf(field: any, person: Person) {
    if (typeof field.name !== 'string' || field.name.includes('.')) return '';
    const value = (person as any)[field.name];
    return this.renderSimpleField(field.title, value);
  }

  private renderEmailsGroup(group: any, person: Person) {
    const emails = person.emails || [];
    if (!emails || emails.length === 0) return '';

    const addressField = group.children.find((c: any) => c.name === 'emails.address');
    const vendorField = group.children.find((c: any) => c.name === 'emails.vendor_id');

    return html`
      <div class="nested-container">
        <h3>${group.title} (${emails.length})</h3>
        ${emails.map((email: Email) => html`
          <div class="nested-item">
            ${this.renderSimpleField(addressField?.title || 'Address', email.address)}
            ${this.renderSimpleField(vendorField?.title || 'Vendor ID', email.vendor_id)}
          </div>
        `)}
      </div>
    `;
  }

  private renderCellPhonesGroup(group: any, person: Person) {
    const phones = person.cell_phones || [];
    if (!phones || phones.length === 0) return '';

    const phoneField = group.children.find((c: any) => c.name === 'cell_phones.phone');
    const prepaidField = group.children.find((c: any) => c.name === 'cell_phones.prepaid');
    const vendorField = group.children.find((c: any) => c.name === 'cell_phones.vendor_id');

    return html`
      <div class="nested-container">
        <h3>${group.title}</h3>
        ${phones.map((phone: CellPhone) => html`
          <div class="nested-item">
            ${this.renderSimpleField(phoneField?.title || 'Phone', phone.phone)}
            ${this.renderSimpleField(prepaidField?.title || 'Prepaid', phone.prepaid)}
            ${this.renderSimpleField(vendorField?.title || 'Vendor ID', phone.vendor_id)}
          </div>
        `)}
      </div>
    `;
  }

  private renderStandardGroup(group: any, person: Person) {
    const content = group.children
      .map((child: any) => this.renderGeneralLeaf(child, person))
      .filter(Boolean);
    if (content.length === 0) return '';
    return html`
      <div class="nested-container">
        <h3>${group.title}</h3>
        ${content}
      </div>
    `;
  }

  private renderGroup(field: PersonApiField, person: Person) {
    if (!this.isGroup(field)) return '';
    const hasEmails = field.children.some((c: any) => typeof c.name === 'string' && c.name.startsWith('emails.'));
    const hasPhones = field.children.some((c: any) => typeof c.name === 'string' && c.name.startsWith('cell_phones.'));
    if (hasEmails) return this.renderEmailsGroup(field, person);
    if (hasPhones) return this.renderCellPhonesGroup(field, person);
    return this.renderStandardGroup(field, person);
  }

  render() {
    if (!this.person) {
      return html`<p>No person data available. Please try the search again.</p>`;
    }

    const p = this.person;

    const sections = personApiFields.map(field => {
      return this.isGroup(field)
        ? this.renderGroup(field, p)
        : this.renderGeneralLeaf(field as any, p);
    }).filter(Boolean);

    return html`
      <div class="report-container">
        <h1>Person Report</h1>
        ${sections}
        <button class="back-button" @click=${this._goBack}>Go back</button>
      </div>
    `;
  }
}