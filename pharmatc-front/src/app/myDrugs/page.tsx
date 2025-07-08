'use client';

import { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API_BASE_URL = 'http://3.25.208.164:8080';

interface DrugDto {
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
}

export default function MyCassettePage() {
    const [searchType, setSearchType] = useState<'itemSeq' | 'ediCode' | 'itemName'>('itemName');
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<DrugDto[]>([]);
    const [savedDrugs, setSavedDrugs] = useState<DrugDto[]>([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('myDrugs');
        if (stored) {
            setSavedDrugs(JSON.parse(stored));
        }
    }, []);

    const handleSearch = async () => {
        const trimmed = searchValue.trim();
        if (!trimmed) return;
        try {
            if (searchType === 'itemSeq') {
                const res = await fetch(`${API_BASE_URL}/api/v1/match`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemSeq: trimmed })
                });
                if (!res.ok) throw new Error('검색 실패');
                const data = await res.json();
                setSearchResults(data.matchedDrugs || []);
            } else {
                const param = searchType === 'ediCode' ? 'ediCode' : 'itemName';
                const res = await fetch(`${API_BASE_URL}/api/v1/drugs/search?${param}=${encodeURIComponent(trimmed)}`);
                if (!res.ok) throw new Error('검색 실패');
                const data = await res.json();
                setSearchResults(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = (drug: DrugDto) => {
        const exists = savedDrugs.find(d => d.itemSeq === drug.itemSeq);
        if (!exists) {
            const safeDrug: DrugDto = {
                itemSeq: drug.itemSeq ?? '',
                itemName: drug.itemName ?? '',
                entpSeq: drug.entpSeq ?? '',
                entpName: drug.entpName ?? '',
                itemImage: drug.itemImage ?? '',
                lengLong: drug.lengLong ?? 0,
                lengShort: drug.lengShort ?? 0,
                thick: drug.thick ?? 0,
                ediCode: drug.ediCode ?? '',
                formCodeName: drug.formCodeName ?? '',
            };
            const updated = [...savedDrugs, safeDrug];
            setSavedDrugs(updated);
            localStorage.setItem('myDrugs', JSON.stringify(updated));
        }
    };

    const handleDelete = (itemSeq: string) => {
        const updated = savedDrugs.filter(d => d.itemSeq !== itemSeq);
        setSavedDrugs(updated);
        localStorage.setItem('myDrugs', JSON.stringify(updated));
    };

    const handleExportToExcel = () => {
        const exportData = savedDrugs.map(drug => ({
            '품목기준코드': drug.itemSeq || '',
            '보험코드': drug.ediCode || '',
            '약품명': drug.itemName || '',
            '제조사': drug.entpName || '',
            '제형': drug.formCodeName || '',
            '장축 길이': typeof drug.lengLong === 'number' ? drug.lengLong : '',
            '단축 길이': typeof drug.lengShort === 'number' ? drug.lengShort : '',
            '두께': typeof drug.thick === 'number' ? drug.thick : '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'MyDrugs');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, '나의약품리스트.xlsx');
    };


    return (
        <>
            <TopNav />
            <div className="p-6 space-y-8">
                <section>
                    <h2 className="text-xl font-bold mb-4">약품 선택</h2>
                    <div className="flex space-x-2 mb-4">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as 'itemSeq' | 'ediCode' | 'itemName')}
                            className="p-2 border rounded"
                        >
                            <option value="itemName">약품명</option>
                            <option value="ediCode">보험코드</option>
                            <option value="itemSeq">품목기준코드</option>
                        </select>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="약품명을 입력하세요"
                            className="flex-1 p-2 border rounded"
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 rounded"
                        >
                            검색
                        </button>
                    </div>

                    <table className="w-full border text-sm">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">보험코드</th>
                            <th className="border p-2">약품명</th>
                            <th className="border p-2"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {searchResults.map((drug, idx) => (
                            <tr key={idx} className="text-center">
                                <td className="border p-2">{drug.ediCode}</td>
                                <td className="border p-2">{drug.itemName}</td>
                                <td className="border p-2">
                                    <button
                                        onClick={() => handleSave(drug)}
                                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                                    >
                                        저장
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">나의 약품 리스트</h2>
                        <button
                            onClick={handleExportToExcel}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        >
                            엑셀로 추출하기
                        </button>
                    </div>
                    <div className="mb-2">
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="약품명을 입력하세요"
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <table className="w-full border text-sm">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">No.</th>
                            <th className="border p-2">보험코드</th>
                            <th className="border p-2">제조사</th>
                            <th className="border p-2">약품명</th>
                            <th className="border p-2"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {savedDrugs
                            .filter((drug) => drug.itemName.toLowerCase().includes(filter.toLowerCase()))
                            .map((drug, idx) => (
                                <tr key={idx} className="text-center">
                                    <td className="border p-2">{idx + 1}</td>
                                    <td className="border p-2">{drug.ediCode}</td>
                                    <td className="border p-2">{drug.entpName}</td>
                                    <td className="border p-2">{drug.itemName}</td>
                                    <td className="border p-2">
                                        <button
                                            onClick={() => handleDelete(drug.itemSeq)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </>
    );
}
