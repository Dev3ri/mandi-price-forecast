export default function SchemeCard({ scheme, compact }) {
  return (
    <article className={'scheme-card' + (compact ? ' compact' : '')}>
      <header className="scheme-card-head">
        <div className="scheme-card-titles">
          <h3 className="scheme-name">{scheme.name}</h3>
          {!compact && <div className="scheme-full-name">{scheme.fullName}</div>}
        </div>
        <span className="scheme-tag">{scheme.category}</span>
      </header>

      <dl className="scheme-facts">
        <div>
          <dt>Benefit</dt>
          <dd>{scheme.benefit}</dd>
        </div>
        {!compact && (
          <div>
            <dt>Who can apply</dt>
            <dd>{scheme.eligibility}</dd>
          </div>
        )}
      </dl>

      {!compact && <div className="scheme-ministry">{scheme.ministry}</div>}

      <a
        className="scheme-link"
        href={scheme.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Apply / learn more on the official site
      </a>
    </article>
  );
}
