// src/types/DrugDto.ts
export interface DrugDto {
    id: number;                // 데이터베이스 고유 식별자 (Primary Key)
    itemSeq: number;
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
