export interface PostImageDraft {
    id: string;
    file_id: string | null;
    sort: number;
    url: string;
    width: number;
    height: number;
    file: File;
    upload_status: 'pending' | 'uploading' | 'completed' | 'error'
}