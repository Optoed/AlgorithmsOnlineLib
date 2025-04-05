
export interface Algorithm {
    id: number;
    code: string;
    programming_language: string;
    title: string;
    topic: string;
    user_id: string;

    is_favorite: boolean;
    created_at: Date;
    description: string;
}