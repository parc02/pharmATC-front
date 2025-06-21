'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

const API_BASE_URL = 'https://pharmatc-backend-production.up.railway.app';

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
  const [searchType, setSearchType] = useState<'itemSeq' | 'ediCode' | 'itemName'>('itemSeq');
  const [searchValue, setSearchValue] = useState('');
  const [tolerance, setTolerance] = useState(0);
  const [sameFormOnly, setSameFormOnly] = useState(false);
  const [searchResults, setSearchResults] = useState<DrugDto[]>([]);
  const [selectedBaseDrug, setSelectedBaseDrug] = useState<DrugDto | null>(null);
  const [results, setResults] = useState<DrugDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredResults = useMemo(() => {
    if (!sameFormOnly || !selectedBaseDrug) return results;
    return results.filter(d => d.formCodeName === selectedBaseDrug.formCodeName);
  }, [results, sameFormOnly, selectedBaseDrug]);

  const handleSearch = async () => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      setError('검색어를 입력해주세요.');
      return;
    }

    if (isNaN(tolerance) || tolerance < 0) {
      setError('허용 오차는 0 이상의 숫자여야 합니다.');
      return;
    }

    setError('');
    setLoading(true);
    setResults([]);
    setSearchResults([]);
    setSelectedBaseDrug(null);

    try {
      if (searchType === 'itemSeq') {
        const res = await fetch(`${API_BASE_URL}/api/v1/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemSeq: trimmed, tolerance }),
        });
        if (!res.ok) throw new Error('매칭 검색 실패');
        const data = await res.json();
        setResults(data.matchedDrugs || []);
      } else {
        const param = searchType === 'ediCode' ? 'ediCode' : 'itemName';
        const res = await fetch(`${API_BASE_URL}/api/v1/drugs/search?${param}=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error('약 검색 실패');
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setSearchResults(list);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('검색 중 오류 발생');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBaseSelect = async (drug: DrugDto) => {
    setSelectedBaseDrug(drug);
    setResults([]);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemSeq: drug.itemSeq, tolerance }),
      });
      if (!res.ok) throw new Error('매칭 검색 실패');
      const data = await res.json();
      setResults(data.matchedDrugs || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('매칭 중 오류 발생');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="flex flex-col md:flex-row h-screen">
        <div className="w-full md:w-1/3 p-4 border-r overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">약품 검색</h1>

          <div className="space-y-4 mb-4">
            <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'itemSeq' | 'ediCode' | 'itemName')}
                className="w-full border rounded p-2"
            >
              <option value="itemSeq">품목기준코드</option>
              <option value="ediCode">보험코드</option>
              <option value="itemName">약품명</option>
            </select>

            <input
                type="text"
                placeholder="검색어 입력"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
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

            <div className="flex items-center space-x-2">
              <input
                  type="checkbox"
                  checked={sameFormOnly}
                  onChange={() => setSameFormOnly(prev => !prev)}
              />
              <label className="text-sm">기준 약과 같은 제형만 보기</label>
            </div>

            <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '검색 중...' : '검색'}
            </button>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>

          {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">검색된 약품 (기준 약 선택)</p>
                {searchResults.map((drug, i) => (
                    <button
                        key={i}
                        onClick={() => handleBaseSelect(drug)}
                        className="w-full text-left border p-2 rounded hover:bg-gray-100"
                    >
                      {drug.itemName}
                    </button>
                ))}
              </div>
          )}

          {selectedBaseDrug && (
              <div className="mt-6 p-4 border rounded bg-gray-50">
                <h3 className="text-md font-semibold mb-2">선택된 기준 약품</h3>
                <p><strong>약품명:</strong> {selectedBaseDrug.itemName}</p>
                <p><strong>제형:</strong> {selectedBaseDrug.formCodeName}</p>
                <p><strong>품목기준코드:</strong> {selectedBaseDrug.itemSeq}</p>
                <p><strong>장축:</strong> {selectedBaseDrug.lengLong} mm</p>
                <p><strong>단축:</strong> {selectedBaseDrug.lengShort} mm</p>
                <p><strong>두께:</strong> {selectedBaseDrug.thick} mm</p>
              </div>
          )}
        </div>

        <div className="w-full md:w-2/3 p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">호환 약품</h2>
          <div className="space-y-4">
            {filteredResults.length > 0 ? (
                filteredResults.map((drug, index) => (
                    <div key={index} className="p-4 border rounded shadow">
                      {drug.itemImage && (
                          <Image
                              src={drug.itemImage}
                              alt={`${drug.itemName} 이미지`}
                              width={128}
                              height={128}
                              className="mb-2 w-32 h-32 object-contain border"
                          />
                      )}
                      <p><strong>약품명:</strong> {drug.itemName}</p>
                      <p><strong>제형:</strong> {drug.formCodeName}</p>
                      <p><strong>품목기준코드:</strong> {drug.itemSeq}</p>
                      <p><strong>업체명:</strong> {drug.entpName} (코드: {drug.entpSeq})</p>
                      <p><strong>장축:</strong> {drug.lengLong} mm</p>
                      <p><strong>단축:</strong> {drug.lengShort} mm</p>
                      <p><strong>두께:</strong> {drug.thick} mm</p>
                      <p><strong>보험코드:</strong> {drug.ediCode}</p>
                    </div>
                ))
            ) : (
                !loading && <p className="text-gray-500 text-sm">호환되는 약품이 없습니다.</p>
            )}
          </div>
        </div>
      </main>
  );
}
