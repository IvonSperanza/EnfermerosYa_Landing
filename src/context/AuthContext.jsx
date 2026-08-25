import { createContext, useContext, useMemo } from 'react';
import { PROFESSIONAL } from '../data/professional';
import { useRouter } from '../router/Router';

const AuthContext = createContext(null);

const CURRENT_USER = {
  id: PROFESSIONAL.id,
  role: 'healthcare_professional',
  roles: ['healthcare_professional', 'patient'],
  name: `${PROFESSIONAL.firstName} ${PROFESSIONAL.lastName}`,
};

export function AuthProvider({ children }) {
  const value = useMemo(
    () => ({
      user: CURRENT_USER,
      isAuthenticated: true,
      logout() {},
    }),
    [],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}

export function RequireRole({ role, message, children }) {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const allowedRoles = user?.roles || (user ? [user.role] : []);
  if (!user || !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-xl font-extrabold text-navy-800">Acceso restringido</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {message || 'Esta sección es exclusiva para profesionales de la salud con sesión iniciada.'}
          </p>
          <button type="button" onClick={() => navigate('/')} className="btn-primary mt-6 w-full">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return children;
}
