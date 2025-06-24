'use client';

import { useEffect, useMemo, useState } from 'react';
import TopNav from '@/components/TopNav';
import SearchForm from '@/components/SearchForm';
import DrugList from '@/components/DrugList';
import SelectedDrugCard from '@/components/SelectedDrugCard';
import MatchResultList from '@/components/MatchResult';
import { DrugDto } from '@/types/DrugDto'; // 타입 통일

const API_BASE_URL = 'https://pharmatc-backend-production.up.railway.app';
// const API_BASE_URL = 'http://localhost:8080';

export default function SearchPage() {
    const [searchType, setSearchType] = useState<'itemSeq' | 'ediCode' | 'itemName'>('itemSeq');
    const [searchValue, setSearchValue] = useState('');
    const [tolerance, setTolerance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState<DrugDto[]>([]);
    const [selectedBaseDrug, setSelectedBaseDrug] = useState<DrugDto | null>(null);
    const [results, setResults] = useState<DrugDto[]>([]);
    const [savedDrugs, setSavedDrugs] = useState<DrugDto[]>([]);
    const [resultFilter, setResultFilter] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('myDrugs');
        if (stored) {
            setSavedDrugs(JSON.parse(stored));
        }
    }, []);

    const filteredResults = useMemo(() => {
        if (!selectedBaseDrug) return [];
        const savedIds = new Set(savedDrugs.map((d) => d.itemSeq));
        const filteredBySearch = results.filter((d) =>
            d.itemName.toLowerCase().includes(resultFilter.toLowerCase())
        );
        return [
            ...filteredBySearch.filter((d) => savedIds.has(d.itemSeq)),
            ...filteredBySearch.filter((d) => !savedIds.has(d.itemSeq)),
        ];
    }, [results, savedDrugs, resultFilter, selectedBaseDrug]);

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
        setSearchResults([]);
        setSelectedBaseDrug(null);
        setResults([]);

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
                const paramKey = searchType === 'ediCode' ? 'ediCode' : 'itemName';
                const res = await fetch(`${API_BASE_URL}/api/v1/drugs/search?${paramKey}=${encodeURIComponent(trimmed)}`);
                if (!res.ok) throw new Error('약품 검색 실패');
                const data = await res.json();
                setSearchResults(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '검색 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    const handleBaseSelect = async (drug: DrugDto): Promise<void> => {
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
            setError(err instanceof Error ? err.message : '매칭 중 오류 발생');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <TopNav />
            <div className="flex h-[calc(100vh-64px)]">
                <div className="w-1/3 p-6 border-r bg-gray-50 space-y-6">
                    <SearchForm
                        searchType={searchType}
                        setSearchType={setSearchType}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        tolerance={tolerance}
                        setTolerance={setTolerance}
                        loading={loading}
                        error={error}
                        onSearch={handleSearch}
                    />
                    <DrugList drugs={searchResults} onSelect={handleBaseSelect} />
                </div>

                <div className="w-2/3 p-6 overflow-y-auto space-y-6">
                    {selectedBaseDrug && <SelectedDrugCard drug={selectedBaseDrug} />}

                    {selectedBaseDrug && (
                        <div>
                            <input
                                type="text"
                                placeholder="호환 결과에서 약품명 검색"
                                value={resultFilter}
                                onChange={(e) => setResultFilter(e.target.value)}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    )}

                    <MatchResultList results={filteredResults} />
                </div>
            </div>
        </>
    );
}