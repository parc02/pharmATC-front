// 'use client';
//
// import { useEffect, useState } from 'react';
//
// const API_BASE_URL = 'https://pharmatc-backend-production.up.railway.app';
//
// interface DrugDto {
//     itemSeq: string;
//     itemName: string;
//     entpSeq: string;
//     entpName: string;
//     itemImage: string;
//     lengLong: number;
//     lengShort: number;
//     thick: number;
//     ediCode: string;
//     formCodeName: string;
// }
//
// export default function MyDrugsModal({ onClose }: { onClose: () => void }) {
//     const [savedDrugs, setSavedDrugs] = useState<DrugDto[]>([]);
//     const [searchValue, setSearchValue] = useState('');
//     const [searchResults, setSearchResults] = useState<DrugDto[]>([]);
//
//     useEffect(() => {
//         const stored = localStorage.getItem('myDrugs');
//         if (stored) {
//             setSavedDrugs(JSON.parse(stored));
//         }
//     }, []);
//
//     const handleSearch = async () => {
//         const trimmed = searchValue.trim();
//         if (!trimmed) return;
//         try {
//             const res = await fetch(`${API_BASE_URL}/api/v1/drugs/search?itemName=${encodeURIComponent(trimmed)}`);
//             if (!res.ok) throw new Error('검색 실패');
//             const data = await res.json();
//             setSearchResults(Array.isArray(data) ? data : []);
//         } catch (err) {
//             console.error(err);
//         }
//     };
//
//     const handleSave = (drug: DrugDto) => {
//         const exists = savedDrugs.find(d => d.itemSeq === drug.itemSeq);
//         if (!exists) {
//             const updated = [...savedDrugs, drug];
//             setSavedDrugs(updated);
//             localStorage.setItem('myDrugs', JSON.stringify(updated));
//         }
//     };
//
//     const handleDelete = (itemSeq: string) => {
//         const updated = savedDrugs.filter(d => d.itemSeq !== itemSeq);
//         setSavedDrugs(updated);
//         localStorage.setItem('myDrugs', JSON.stringify(updated));
//     };
//
//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//             <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
//                 <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
//                 <h2 className="text-xl font-bold mb-4">내 사용약</h2>
//
//                 {/* 검색 영역 */}
//                 <div className="mb-6">
//                     <div className="flex space-x-2 mb-2">
//                         <input
//                             type="text"
//                             placeholder="약품명으로 검색"
//                             value={searchValue}
//                             onChange={(e) => setSearchValue(e.target.value)}
//                             className="flex-1 border rounded p-2"
//                         />
//                         <button
//                             onClick={handleSearch}
//                             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                         >
//                             검색
//                         </button>
//                     </div>
//                     {searchResults.map((drug, index) => (
//                         <div key={index} className="p-2 border rounded mb-2 flex justify-between items-center">
//                             <span>{drug.itemName}</span>
//                             <button onClick={() => handleSave(drug)} className="text-sm text-green-600 hover:underline">
//                                 저장
//                             </button>
//                         </div>
//                     ))}
//                 </div>
//
//                 {/* 저장된 약 리스트 */}
//                 {savedDrugs.length === 0 ? (
//                     <p className="text-gray-600">저장된 약품이 없습니다.</p>
//                 ) : (
//                     <ul className="space-y-2">
//                         {savedDrugs.map((drug, index) => (
//                             <li
//                                 key={index}
//                                 className="border p-3 rounded flex justify-between items-center bg-gray-50"
//                             >
//                                 <div>
//                                     <p><strong>{index + 1}. {drug.itemName}</strong></p>
//                                     <p className="text-sm text-gray-600">
//                                         보험코드: {drug.ediCode} / 크기: {drug.lengLong}×{drug.lengShort}×{drug.thick} mm
//                                     </p>
//                                 </div>
//                                 <button
//                                     onClick={() => handleDelete(drug.itemSeq)}
//                                     className="text-sm text-red-500 hover:underline"
//                                 >
//                                     삭제
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </div>
//         </div>
//     );
// }
