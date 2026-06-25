'use client';

import { useState } from 'react';
import { NEWS_CATEGORY_LABELS } from '@/lib/constants/navigation';

export default function NewsFilters() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div className="filters mb-lg">
      <input
        className="form__input filters__search"
        placeholder="Search articles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="form__select filters__select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {Object.entries(NEWS_CATEGORY_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  );
}
