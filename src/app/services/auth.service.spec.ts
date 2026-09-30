/// <reference types="jasmine" />

import { Session } from '@supabase/supabase-js';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let onAuthStateChangeCallback: ((event: string, session: Session | null) => void) | undefined;

  function createDbServiceMock(session: Session | null) {
    return {
      getSession: jasmine.createSpy('getSession').and.resolveTo({
        data: { session },
        error: null,
      }),
      onAuthStateChange: jasmine.createSpy('onAuthStateChange').and.callFake((callback: (event: string, nextSession: Session | null) => void) => {
        onAuthStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe() {} } } };
      }),
      signInWithPassword: jasmine.createSpy('signInWithPassword').and.resolveTo(true),
      signOut: jasmine.createSpy('signOut').and.resolveTo(true),
    };
  }

  it('restaura sesión activa al iniciar', async () => {
    const dbServiceMock = createDbServiceMock({ user: { email: 'admin@informapp.com' } } as unknown as Session);
    const service = new AuthService(dbServiceMock as any);

    expect(await service.isLoggedIn()).toBeTrue();
  });

  it('actualiza estado cuando cambia la sesión', async () => {
    const dbServiceMock = createDbServiceMock(null);
    const service = new AuthService(dbServiceMock as any);

    expect(await service.isLoggedIn()).toBeFalse();

    onAuthStateChangeCallback?.('SIGNED_IN', { user: { email: 'admin@informapp.com' } } as unknown as Session);
    expect(await service.isLoggedIn()).toBeTrue();

    onAuthStateChangeCallback?.('SIGNED_OUT', null);
    expect(await service.isLoggedIn()).toBeFalse();
  });

  it('delegates login and logout to database service', async () => {
    const dbServiceMock = createDbServiceMock(null);
    const service = new AuthService(dbServiceMock as any);

    await service.login('admin@informapp.com', 'secret');
    expect(dbServiceMock.signInWithPassword).toHaveBeenCalledWith('admin@informapp.com', 'secret');

    await service.logout();
    expect(dbServiceMock.signOut).toHaveBeenCalled();
  });
});
