import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../data/content';
import { cn } from '../lib/utils';
import { Link } from '../router/Router';
import Logo from './Logo';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="container-page flex items-center justify-between gap-4 py-3 lg:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-action"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/cliente/dashboard"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-navy-800 transition-colors hover:text-action"
          >
            Iniciar sesión
          </Link>
          <a href="#profesionales" className="btn-primary px-4 py-2.5">
            Buscar profesional
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-navy-800 transition-colors hover:border-action hover:text-action xl:hidden"
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          'grid overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 xl:hidden',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] border-t-0 opacity-0'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Navegación móvil">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-action"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
              <Link
                to="/cliente/dashboard"
                onClick={() => setOpen(false)}
                className="btn-secondary flex-1"
              >
                Iniciar sesión
              </Link>
              <a
                href="#profesionales"
                onClick={() => setOpen(false)}
                className="btn-primary flex-1"
              >
                Buscar profesional
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
