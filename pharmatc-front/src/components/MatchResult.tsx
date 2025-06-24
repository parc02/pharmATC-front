interface DrugDto {
    itemImage: string;
    itemName: string;
    ediCode: string;
    entpName: string;
    formCodeName: string;
    lengLong: number;
    lengShort: number;
    thick: number;
}

export default function MatchResultList({ results }: { results: DrugDto[] }) {
    return (
        <div>
            <h3 className="font-semibold text-md mb-2">검색 결과</h3>
            <div className="space-y-4">
                {results.length > 0 ? (
                    results.map((drug, i) => (
                        <div key={i} className="flex p-4 border rounded bg-white items-center space-x-4">
                            <img
                                src={drug.itemImage}
                                alt={drug.itemName}
                                width={80}
                                height={80}
                                className="border object-contain"
                            />
                            <div className="text-sm space-y-1">
                                <p>보험코드: {drug.ediCode}</p>
                                <p>제조사: {drug.entpName}</p>
                                <p>약품명: {drug.itemName}</p>
                                <p>제형: {drug.formCodeName}</p>
                                <p>
                                    장축: {drug.lengLong} mm / 단축: {drug.lengShort} mm / 두께:{' '}
                                    {drug.thick} mm
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">호환되는 약품이 없습니다.</p>
                )}
            </div>
        </div>
    );
}
