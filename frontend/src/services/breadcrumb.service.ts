export interface Breadcrumb {
  label: string;
  path: string;
}

class BreadcrumbService {
  private _breadcrumbs: Breadcrumb[] = [{ label: 'Home', path: '/' }];
  private subscribers: Function[] = [];
  // Lista de rutas principales que no deben anidarse
  private topLevelPaths = ['/', '/search-history', '/statistics'];

  get breadcrumbs(): Breadcrumb[] {
    return this._breadcrumbs;
  }

  public navigate(label: string, path: string) {
    const isTopLevel = this.topLevelPaths.includes(path);

    if (isTopLevel) {
      // Si es una ruta principal, reinicia el rastro y añade la nueva ruta
      this._breadcrumbs = [{ label: 'Home', path: '/' }];
      if (path !== '/') {
        this._breadcrumbs.push({ label, path });
      }
    } else {
      // Lógica existente para rutas anidadas (ej. Reporte, Resultados)
      if (this._breadcrumbs.length > 0 && this._breadcrumbs[this._breadcrumbs.length - 1].path === path) {
        return;
      }

      const existingIndex = this._breadcrumbs.findIndex(crumb => crumb.path === path);

      if (existingIndex > -1) {
        this._breadcrumbs = this._breadcrumbs.slice(0, existingIndex + 1);
      } else {
        this._breadcrumbs.push({ label, path });
      }
    }
    this.notify();
  }

  public reset() {
    this._breadcrumbs = [{ label: 'Home', path: '/' }];
    this.notify();
  }

  subscribe(callback: Function) {
    this.subscribers.push(callback);
  }

  unsubscribe(callback: Function) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  private notify() {
    this.subscribers.forEach(callback => callback());
  }
}

export const breadcrumbService = new BreadcrumbService();