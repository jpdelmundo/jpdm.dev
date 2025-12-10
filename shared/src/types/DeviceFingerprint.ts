export interface DeviceFingerprint {
    device_id: string;
    client_tz: string;
    screen_width: number;
    screen_height: number;
    cpu_count: number;
    os?: string;
    device?: string;
    device_type?: string;
    client?: string;
}