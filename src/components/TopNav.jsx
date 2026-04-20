import Link from 'next/link';

export default function TopNav({ active }) {
  const navItems = [
    { label: 'SELECTED EXHIBITIONS', href: '/exhibitions', key: 'exhibitions' },
    { label: 'WORK',                  href: '/work',        key: 'work' },
    { label: 'ABOUT',                 href: '/about',       key: 'about' },
    { label: 'CONTACT',               href: '/contact',     key: 'contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-white border-b border-neutral-100">
      <Link href="/" className="text-xs tracking-widest hover:opacity-50 transition-opacity">
        EDIE XU
      </Link>
      <nav className="flex items-center gap-8">
        {navItems.map((item, i) => (
          <span key={item.key} className="flex items-center gap-8">
            {i === 1 && (
              <span className="text-xs text-neutral-300 select-none">/</span>
            )}
            <Link
              href={item.href}
              className={`text-xs tracking-widest transition-opacity ${
                active === item.key
                  ? 'underline underline-offset-4'
                  : 'hover:opacity-50'
              }`}
            >
              {item.label}
            </Link>
          </span>
        ))}
      </nav>
    </header>
  );
}
