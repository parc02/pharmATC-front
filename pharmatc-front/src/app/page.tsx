'use client';

import { useState } from 'react';

export default function Home() {
  const [itemSeq, setItemSeq] = useState('');
  const [tolerance, setTolerance] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const trimmed = itemSeq.trim();

    if (!trimmed) {
      setError('품목기준코드를 입력해주세요.');
      return;
    }

    if (isNaN(tolerance) || tolerance < 0) {
      setError('허용 오차는 0 이상의 숫자여야 합니다.');
      return;
    }

    setError('');
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch('http://localhost:8080/api/v1/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemSeq: trimmed,
          tolerance: Number(tolerance),
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.matchedDrugs || []);
    } catch (err: any) {
      setError(err.message || '검색 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">약품 호환성 검색</h1>

        <div className="space-y-4 mb-6">
          <input
              type="text"
              placeholder="품목기준코드 (예: 12345678)"
              value={itemSeq}
              onChange={(e) => setItemSeq(e.target.value)}
              className="w-full border rounded p-2"
          />

          <select
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full border rounded p-2"
          >
            <option value={0}>오차 없음 (0%)</option>
            <option value={5}>5%</option>
            <option value={10}>10%</option>
            <option value={15}>15%</option>
            <option value={20}>20%</option>
          </select>

          <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '검색 중...' : '검색'}
          </button>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <div className="space-y-4">
          {results.map((drug, index) => (
              <div key={index} className="p-4 border rounded shadow">
                <p><strong>약품명:</strong> {drug.name}</p>
                <p><strong>품목기준코드:</strong> {drug.itemSeq}</p>
                <p><strong>제형:</strong> {drug.dosageForm}</p>
                <p><strong>장축:</strong> {drug.lengLong} mm</p>
                <p><strong>단축:</strong> {drug.lengShort} mm</p>
                <p><strong>두께:</strong> {drug.thickness} mm</p>
              </div>
          ))}
        </div>
      </main>
  );
}
