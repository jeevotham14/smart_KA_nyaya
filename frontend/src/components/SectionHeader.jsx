export default function SectionHeader({ eyebrow, title, children, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.18em] text-legalGold">{eyebrow}</p> : null}
      <h2 className="mt-2 font-serif text-3xl font-bold text-navy-900 md:text-4xl">{title}</h2>
      {children ? <p className="mt-4 text-base leading-7 text-slate-600">{children}</p> : null}
    </div>
  );
}
