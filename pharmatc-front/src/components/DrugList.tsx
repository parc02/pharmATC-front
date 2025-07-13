'use client';

import { DrugDto } from '@/types/DrugDto';

export default function DrugList({
                                     drugs,
                                     onSelect,
                                 }: {
    drugs: DrugDto[];
    onSelect: (drug: DrugDto) => void | Promise<void>;
}) {
    return (
        <div>
            <h3 className="text-md font-medium mb-2">약품 선택</h3>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
                {drugs.map((drug) => (
                    <li
                        key={drug.id} // ✅ 고유 식별자 사용
                        className="flex items-center justify-between p-2 bg-white border rounded"
                    >
                        <div>
                            <p className="text-sm font-medium">{drug.ediCode}</p>
                            <p className="text-xs text-gray-500">{drug.itemName}</p>
                        </div>
                        <button
                            onClick={() => onSelect(drug)}
                            className="text-yellow-700 border border-yellow-500 px-2 py-1 text-xs rounded"
                        >
                            선택
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
