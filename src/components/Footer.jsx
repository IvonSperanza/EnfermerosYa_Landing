import { SOCIAL_LINKS, FOOTER_COLUMNS } from '../data/content';
import Logo from './Logo';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-blue-100">
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[minmax(0,4fr)_repeat(4,minmax(0,2fr))] lg:gap-8 lg:py-16">
        <div className="max-w-xs">
          <Logo tone="dark" />
          <p className="mt-5 text-sm leading-relaxed text-blue-200/80">
            La forma más simple de encontrar profesionales de la salud verificados cerca tuyo.
            Atención a domicilio y e-consultas en un solo lugar.
          </p>

          <div className="mt-6 flex items-center gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-blue-200 transition-colors hover:border-action hover:bg-action hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">{column.title}</h3>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link}>
                  <a
                    href="#inicio"
                    className="text-sm font-medium text-blue-200/80 transition-colors hover:text-white"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs font-medium text-blue-200/70 sm:flex-row">
          <p>© {year} EnfermerosYa. Todos los derechos reservados.</p>
          <p>Hecho con dedicación en Argentina.</p>
        </div>
      </div>
    </footer>
  );
}
