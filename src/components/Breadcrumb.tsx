export default function Breadcrumb({ items }: { items: string[][] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Tools</a>
      {items.map(([label, href], i) => (
        <span key={href}>
          /
          <a
            href={href}
            aria-current={i === items.length - 1 ? "page" : undefined}
          >
            {label}
          </a>
        </span>
      ))}
    </nav>
  );
}
