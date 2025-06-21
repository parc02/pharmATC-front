'use client';

import { useState, useMemo } from 'react';

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
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [sameFormOnly, setSameFormOnly] = useState(false);
  const [baseFormCodeName, setBaseFormCodeName] = useState<string | null>(null);

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
    setBaseFormCodeName(null);

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

      // 기준 약품 제형 추출
      const baseDrug = data.matchedDrugs?.find((d: DrugDto) => d.itemSeq === trimmed);
      if (baseDrug) {
        setBaseFormCodeName(baseDrug.formCodeName);
      } else if (data.baseFormCodeName) {
        setBaseFormCodeName(data.baseFormCodeName);
      }
    } catch (err: any) {
      setError(err.message || '검색 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formOptions = useMemo(() => {
    const unique = new Set<string>();
    results.forEach((d) => {
      if (d.formCodeName) unique.add(d.formCodeName);
    });
    return Array.from(unique);
  }, [results]);

  const toggleForm = (form: string) => {
    setSelectedForms((prev) =>
        prev.includes(form) ? prev.filter((f) => f !== form) : [...prev, form]
    );
  };

  const filteredResults = useMemo(() => {
    let filtered = results;
    if (sameFormOnly && baseFormCodeName) {
      filtered = filtered.filter((drug) => drug.formCodeName === baseFormCodeName);
    }
    if (selectedForms.length > 0) {
      filtered = filtered.filter((drug) => selectedForms.includes(drug.formCodeName));
    }
    return filtered;
  }, [results, sameFormOnly, selectedForms, baseFormCodeName]);

  return (
      <main className="flex flex-col md:flex-row h-screen">
        {/* 검색 영역 */}
        <div className="w-full md:w-1/3 p-4 border-r overflow-y-auto">
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

            <div className="flex items-center space-x-2">
              <input
                  type="checkbox"
                  id="sameFormOnly"
                  checked={sameFormOnly}
                  onChange={(e) => setSameFormOnly(e.target.checked)}
              />
              <label htmlFor="sameFormOnly" className="text-sm">입력한 약과 같은 제형만 보기</label>
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

          {/* 제형 필터 */}
          {formOptions.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">제형 필터</h2>
                {formOptions.map((form) => (
                    <label key={form} className="block text-sm">
                      <input
                          type="checkbox"
                          checked={selectedForms.includes(form)}
                          onChange={() => toggleForm(form)}
                          className="mr-2"
                      />
                      {form}
                    </label>
                ))}
              </div>
          )}
        </div>

        {/* 결과 영역 */}
        <div className="w-full md:w-2/3 p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">검색 결과</h2>
          <div className="space-y-4">
            {filteredResults.length > 0 ? (
                filteredResults.map((drug, index) => (
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
        </div>
      </main>
  );
}
