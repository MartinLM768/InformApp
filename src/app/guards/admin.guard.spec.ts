/// <reference types="jasmine" />

import { Router } from '@angular/router';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  it('permite navegación cuando hay sesión', async () => {
    const authServiceMock = {
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.resolveTo(true),
    };
    const routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const guard = new AdminGuard(authServiceMock as any, routerMock);

    await expectAsync(guard.canActivate()).toBeResolvedTo(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('redirige a login cuando no hay sesión', async () => {
    const authServiceMock = {
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.resolveTo(false),
    };
    const routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const guard = new AdminGuard(authServiceMock as any, routerMock);

    await expectAsync(guard.canActivate()).toBeResolvedTo(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
