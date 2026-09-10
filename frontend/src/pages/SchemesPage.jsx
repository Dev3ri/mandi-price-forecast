import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SchemeCard from '../components/SchemeCard';
import { SCHEMES, SCHEME_CATEGORIES } from '../data/schemes';
import '../styles/dashboard.css';
import '../styles/schemes.css';

const ALL = 'All schemes';

export default function SchemesPage() {
  const [category, setCategory] = useState(ALL);

  const visible = category === ALL ? SCHEMES : SCHEMES.filter((s) => s.category === category);

  return (
    <div className="app-shell">
      <Sidebar
        footer={
          <>
            Scheme details are maintained here by hand — the government does not
            publish an API for them. Always confirm eligibility and deadlines on
            the official portal before applying.
          </>
        }
      />

      <main className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">MandiYojana</h1>
            <div className="page-subtitle">Government schemes</div>
            <div className="page-meta">
              Key Government of India schemes for farmers, with a direct link to each official portal
            </div>
          </div>
        </div>

        <div className="scheme-filters" role="group" aria-label="Filter schemes by category">
          {[ALL, ...SCHEME_CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              className={'scheme-chip' + (c === category ? ' active' : '')}
              aria-pressed={c === category}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="scheme-grid">
          {visible.map((s) => (
            <SchemeCard key={s.id} scheme={s} />
          ))}
        </div>

        <p className="scheme-disclaimer">
          Scheme terms, subsidy rates and eligibility are set by the government
          and can change. Verify on the official website before applying.
        </p>
      </main>
    </div>
  );
}
