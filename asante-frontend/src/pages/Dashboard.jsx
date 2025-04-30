// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecommendations } from '../services/ml-service';

/**
 * Returns a list like:
 *  [1, 2, 3, 4, 5, 'ellipsis', totalPages-2, totalPages-1, totalPages]
 *  but sliding ±2 around the current page.
 */
function generatePageList(totalPages, current) {
  const pagesSet = new Set([1, totalPages]);
  for (let i = current - 2; i <= current + 2; i++) {
    if (i > 1 && i < totalPages) pagesSet.add(i);
  }
  const sorted = Array.from(pagesSet).sort((a, b) => a - b);
  return sorted.reduce((acc, page, idx) => {
    if (idx > 0 && page - sorted[idx - 1] > 1) {
      acc.push('ellipsis');
    }
    acc.push(page);
    return acc;
  }, []);
}

function PaginatedGrid({ title, items }) {
  const itemsPerPage = 6;
  const totalPages   = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const [page, setPage] = useState(1);

  // clamp page if totalPages shrinks
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const start     = (page - 1) * itemsPerPage;
  const pageItems = items.slice(start, start + itemsPerPage);
  const pagesToShow = generatePageList(totalPages, page);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageItems.map((name, idx) => (
          <div
            key={`${title}-${idx}`}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200"
          >
            <p className="text-sm font-medium line-clamp-2">{name}</p>
          </div>
        ))}

        {pageItems.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No {title.toLowerCase()} found.
          </p>
        )}
      </div>

      <div className="flex justify-center items-center space-x-2 mt-4 text-sm">
        {pagesToShow.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`ell-${idx}`} className="px-2 text-gray-500">
              …
            </span>
          ) : (
            <button
              key={`page-${p}`}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded ${
                p === page
                  ? 'bg-asante-blue text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
    </section>
  );
}

const Dashboard = () => {
  const { userId } = useParams();
  const [recs, setRecs]       = useState({ product_ids: [], business_ids: [], nonprofit_ids: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true);
    getRecommendations(userId)
      .then(data => {
        setRecs(data);
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load recommendations.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Welcome, {userId}</h1>

      {loading && <p>Loading recommendations…</p>}
      {error   && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <PaginatedGrid title="Recommended Products"   items={recs.product_ids}   />
          <PaginatedGrid title="Recommended Businesses" items={recs.business_ids}  />
          <PaginatedGrid title="Recommended Nonprofits" items={recs.nonprofit_ids} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
