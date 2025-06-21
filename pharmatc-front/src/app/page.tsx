'use client';

import { useState } from 'react';

type DrugDto = {
  itemSeq: string;
  itemName: string;
  entpSeq: string;
  entpName: string;
  itemImage: string;
  lengLong: number;
  lengShort: number;
  thick: number;
  ediCode: string;
  formCodeName: string;
};

export default function Home() {
  const [itemSeq, setItemSeq] = useState('');
  const [tolerance, setTolerance] = useState(0);
  const [results, setResults] = useState<DrugDto[]>([]);
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">카세트 약품 호환성 검색</h1>

        <div className="space-y-4 mb-6">
          <input
              type="text"
              placeholder="품목기준코드 (예: 200906540)"
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
          {results.length > 0 ? (
              results.map((drug, index) => (
                  <div key={index} className="p-4 border rounded shadow">
                    {drug.itemImage && (
                        <img
                            src={drug.itemImage}
                            alt={`${drug.itemName} 이미지`}
                            className="mb-2 w-32 h-32 object-contain border"
                        />
                    )}
                    <p><strong>약품명:</strong> {drug.itemName}</p>
                    <p><strong>품목기준코드:</strong> {drug.itemSeq}</p>
                    <p><strong>업체명:</strong> {drug.entpName} (코드: {drug.entpSeq})</p>
                    <p><strong>제형:</strong> {drug.formCodeName}</p>
                    <p><strong>장축:</strong> {drug.lengLong} mm</p>
                    <p><strong>단축:</strong> {drug.lengShort} mm</p>
                    <p><strong>두께:</strong> {drug.thick} mm</p>
                    <p><strong>보험코드:</strong> {drug.ediCode}</p>
                  </div>
              ))
          ) : (
              !loading && <p className="text-gray-500 text-sm">검색 결과가 없습니다.</p>
          )}
        </div>
      </main>
  );
}
