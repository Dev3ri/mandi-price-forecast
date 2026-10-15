import { Link } from 'react-router-dom';
import SchemeCard from './SchemeCard';
import { SCHEMES } from '../data/schemes';
import '../styles/schemes.css';

export default function SchemesPanel({ limit = 3 }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Government schemes</div>
          <div className="panel-sub">Central schemes a farmer selling at these mandis can apply for</div>
        </div>
        <Link className="panel-link" to="/schemes">View all</Link>
      </div>
      <div className="scheme-grid">
        {SCHEMES.slice(0, limit).map((s) => (
          <SchemeCard key={s.id} scheme={s} compact />
        ))}
      </div>
    </div>
  );
}
