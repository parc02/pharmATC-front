import { DrugDto } from '@/types/DrugDto'; // 실제 위치에 따라 경로 조정

export default function DrugList({
                                     drugs,
                                     onSelect,
                                 }: {
    drugs: DrugDto[];
    onSelect: (drug: DrugDto) => void | Promise<void>; // async도 허용
}) {
    return (
        <div>
            <h3 className="text-md font-medium mb-2">약품 선택</h3>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
                {drugs.map((drug, i) => (
                    <li
                        key={i}
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
