export interface Review {
    id: number;
    user_id: number;
    algorithm_id: number;
    rating: number | null;
    review_text: string | null;
    created_at: string;
    updated_at: string | null;
}