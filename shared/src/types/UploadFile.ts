export type UploadFile = {
    file: File;
    url: string;
    width: number;
    height: number;
    clientId: string;
    fileId: string | null;
    uploadStatus: 'pending' | 'uploading' | 'completed' | 'error'
}