interface SearchFormProps {
    searchType: 'itemSeq' | 'ediCode' | 'itemName';
    setSearchType: (val: 'itemSeq' | 'ediCode' | 'itemName') => void;
    searchValue: string;
    setSearchValue: (val: string) => void;
    tolerance: number;
    setTolerance: (val: number) => void;
    loading: boolean;
    error: string;
    onSearch: () => void;
}

export default function SearchForm({
                                       searchType,
                                       setSearchType,
                                       searchValue,
                                       setSearchValue,
                                       tolerance,
                                       setTolerance,
                                       loading,
                                       error,
                                       onSearch,
                                   }: SearchFormProps) {
    return (
        <div>
            <h2 className="font-semibold text-lg mb-4">약품 검색</h2>

            <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'itemSeq' | 'ediCode' | 'itemName')}
                className="w-full mb-3 p-2 border rounded"
            >
                <option value="itemSeq">품목기준코드</option>
                <option value="ediCode">보험코드</option>
                <option value="itemName">약품명</option>
            </select>

            <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
            />

            <select
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full mb-3 p-2 border rounded"
            >
                <option value={0}>오차 없음 (0%)</option>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
            </select>

            <button
                onClick={onSearch}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? '검색 중...' : '검색'}
            </button>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
}
