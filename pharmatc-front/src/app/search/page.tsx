'use client';

import { useEffect, useState, useMemo } from 'react';
import TopNav from '@/components/TopNav';
import SearchForm from '@/components/SearchForm';
import DrugList from '@/components/DrugList';
import SelectedDrugCard from '@/components/SelectedDrugCard';
import MatchResultList from '@/components/MatchResult';
import { DrugDto } from '@/types/DrugDto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function SearchPage() {
    // 상태 변수 정의
    const [searchType, setSearchType] = useState<'itemSeq' | 'ediCode' | 'itemName'>('itemName');
    const [searchValue, setSearchValue] = useState('');
    const [tolerance, setTolerance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState<DrugDto[]>([]);
    const [selectedBaseDrug, setSelectedBaseDrug] = useState<DrugDto | null>(null);
    const [results, setResults] = useState<DrugDto[]>([]);
    const [savedDrugs, setSavedDrugs] = useState<DrugDto[]>([]);
    const [resultFilter, setResultFilter] = useState('');

    // 로컬 스토리지에서 저장된 약품 정보 불러오기
    useEffect(() => {
        const stored = localStorage.getItem('myDrugs');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setSavedDrugs(parsed.filter((d) => d.id));  // id로 필터링
                }
            } catch (e) {
                console.error('로컬 스토리지 파싱 오류', e);
            }
        }
    }, []);

    // 검색 처리 함수
    const handleSearch = async () => {
        const trimmed = searchValue.trim();
        if (!trimmed) {
            setError('검색어를 입력해주세요.');
            return;
        }

        if (searchType === 'itemName' && trimmed.length < 3) {
            setError('약품명은 3자 이상 입력해야 검색이 가능합니다.');
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
            console.log('요청 보내는 데이터:', { itemSeq: trimmed, tolerance });  // 요청 데이터 확인

            let url = `${API_BASE_URL}/api/v1/match`;
            if (searchType === 'itemSeq') {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemSeq: trimmed, tolerance }), // 요청 데이터
                });

                console.log('API 응답 상태:', res);  // 응답 상태 확인
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

    // 기준 약품을 선택하는 함수
    const handleBaseSelect = async (drug: DrugDto): Promise<void> => {
        console.log('선택된 약품:', drug);  // 선택된 약품의 id 확인
        if (!drug.id) {
            alert("선택된 약품에 id가 없습니다.");
            return;
        }

        setSelectedBaseDrug(drug);  // 선택한 약품 정보를 설정
        setResults([]);  // 이전 결과 리셋
        setLoading(true);  // 로딩 시작

        try {
            console.log(`매칭 요청 데이터: ${JSON.stringify({ id: drug.id, tolerance })}`); // 요청 데이터 확인

            const res = await fetch(`${API_BASE_URL}/api/v1/match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: drug.id, tolerance }),  // id로 매칭 요청
            });

            console.log('API 응답 상태:', res);  // 응답 상태 확인
            if (!res.ok) throw new Error('매칭 검색 실패');
            const data = await res.json();
            setResults(data.matchedDrugs || []);  // 매칭된 약품 결과 저장
        } catch (err) {
            setError(err instanceof Error ? err.message : '매칭 중 오류 발생');
        } finally {
            setLoading(false);  // 로딩 종료
        }
    };

    // 필터링된 결과 계산
    const filteredResults = useMemo(() => {
        if (!selectedBaseDrug) return [];
        const savedIds = new Set(savedDrugs.map((d) => d.id));  // 저장된 약품 id 추출
        const filteredBySearch = results.filter((d) =>
            d.itemName.toLowerCase().includes(resultFilter.toLowerCase())  // 약품명 검색 필터
        );
        return [
            ...filteredBySearch.filter((d) => savedIds.has(d.id)),  // 저장된 약품 먼저 표시
            ...filteredBySearch.filter((d) => !savedIds.has(d.id)),  // 저장되지 않은 약품 나중에 표시
        ];
    }, [results, savedDrugs, resultFilter, selectedBaseDrug]);

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
                        onSearch={handleSearch}  // 검색 처리 함수
                    />
                    <DrugList drugs={searchResults} onSelect={handleBaseSelect} />  {/* 약품 목록 */}
                </div>

                <div className="w-2/3 p-6 overflow-y-auto space-y-6">
                    {selectedBaseDrug && <SelectedDrugCard drug={selectedBaseDrug} />}  {/* 선택된 약품 카드 */}

                    {selectedBaseDrug && (
                        <div>
                            <input
                                type="text"
                                placeholder="호환 결과에서 약품명 검색"
                                value={resultFilter}
                                onChange={(e) => setResultFilter(e.target.value)}  // 호환 결과 필터링
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    )}

                    <MatchResultList results={filteredResults} />  {/* 필터링된 매칭 결과 목록 */}
                </div>
            </div>
        </>
    );
}
