import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from '../router/Router';

const AuthContext = createContext(null);

const TOKEN_KEY = 'ey_token';

const PUBLIC_PATHS = ['/', '/ingresar', '/registrarse', '/profesional/login'];

// Convierte el role del backend (patient | professional | admin) al set de roles
// que consumen las pantallas (patient | healthcare_professional | admin).
function rolesFor(role) {
  switch (role) {
    case 'professional':
      return ['healthcare_professional'];
    case 'admin':
      return ['admin', 'healthcare_professional'];
    case 'patient':
    default:
      return ['patient'];
  }
}

function getUserWithAvailabilities(user) {
  if (!user) return null;
  const roles = rolesFor(user.role);
  return {
    id: user.id,
    role: user.role,
    roles,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`,
    patientId: user.patientId,
    professionalId: user.professionalId,
  };
}

async function authRequest(path, options = {}) {
  const response = await fetch(`/api/auth${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    /* ignore */
  }
  if (!response.ok) {
    throw new Error(body?.error || `Error ${response.status}`);
  }
  return body;
}

export function AuthProvider({ children }) {
  const { navigate } = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authRequest('/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((me) => setUser(getUserWithAvailabilities(me)))
      .catch(() => window.localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      window.localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      navigate('/ingresar', { replace: true });
    };
    window.addEventListener('ey:unauthorized', onUnauthorized);
    return () => window.removeEventListener('ey:unauthorized', onUnauthorized);
  }, [navigate]);

  const applySession = (data) => {
    window.localStorage.setItem(TOKEN_KEY, data.token);
    const sessionUser = getUserWithAvailabilities({
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      patientId: data.patientId,
      professionalId: data.professionalId,
    });
    setUser(sessionUser);
    return sessionUser;
  };

  const login = useCallback(async (email, password) => {
    const data = await authRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return applySession(data);
  }, []);

  const register = useCallback(async ({ email, password, firstName, lastName, role = 'patient' }) => {
    const data = await authRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName, role }),
    });
    return applySession(data);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    navigate('/');
  }, [navigate]);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, register, logout }),
    [user, isLoading, login, register, logout],
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
  const { user, isLoading, isAuthenticated } = useAuth();
  const { pathname, navigate } = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-action" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const from = PUBLIC_PATHS.includes(pathname) ? null : pathname;
    return <NavigateToLogin from={from} />;
  }

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

function NavigateToLogin({ from }) {
  const { navigate } = useRouter();

  useEffect(() => {
    const target = from ? `/ingresar?redirect=${encodeURIComponent(from)}` : '/ingresar';
    navigate(target, { replace: true });
  }, [from, navigate]);

  return null;
}
