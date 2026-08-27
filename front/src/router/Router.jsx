import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const RouterContext = createContext(null);

function readLocation() {
  const raw = `${window.location.pathname}${window.location.search}`;
  return raw.replace(/\/+$/, '') || '/';
}

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    const onPopState = () => setLocation(readLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const target = to.startsWith('/') ? to : `/${to}`;
    if (replace) {
      window.history.replaceState(null, '', target);
    } else {
      window.history.pushState(null, '', target);
    }
    setLocation(readLocation());
    window.scrollTo({ top: 0 });
  }, []);

  const value = useMemo(() => {
    const [pathname, search = ''] = location.split('?');
    return {
      location,
      pathname: pathname || '/',
      query: new URLSearchParams(search),
      navigate,
    };
  }, [location, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter debe usarse dentro de <RouterProvider>');
  }
  return context;
}

export function matchPath(pattern, pathname) {
  const patternSegments = pattern.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pattern.endsWith('/*')) {
    const base = patternSegments.slice(0, -1);
    if (pathSegments.length < base.length) return null;
    for (let i = 0; i < base.length; i += 1) {
      if (base[i] !== pathSegments[i]) return null;
    }
    return { params: {} };
  }

  if (patternSegments.length !== pathSegments.length) return null;

  const params = {};
  for (let i = 0; i < patternSegments.length; i += 1) {
    const segment = patternSegments[i];
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = decodeURIComponent(pathSegments[i]);
    } else if (segment !== pathSegments[i]) {
      return null;
    }
  }
  return { params };
}

export function useRouteMatch(pattern) {
  const { pathname } = useRouter();
  return useMemo(() => matchPath(pattern, pathname), [pattern, pathname]);
}

export function Link({ to, replace, children, onClick, ...rest }) {
  const { navigate } = useRouter();

  const handleClick = (event) => {
    if (onClick) onClick(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    navigate(to, { replace });
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export function Navigate({ to, replace = true }) {
  const { navigate } = useRouter();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
}
