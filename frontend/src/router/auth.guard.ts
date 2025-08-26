import { Router } from '@vaadin/router';
import { authService } from '../services/auth.service';

export const authGuard = async (
  context: any,
  commands: any
): Promise<any> => {
  if (!(await authService.isAuthenticated())) {
    return commands.redirect('/login');
  }
  return undefined;
};