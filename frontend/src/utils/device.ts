import type { DeviceFingerprint } from '@shared/types/DeviceFingerprint';

export const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('device_id', deviceId);
    }

    return deviceId;
}

export const getFingerprint = (): DeviceFingerprint => {
    return {
        device_id: getDeviceId(),
        client_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen_width: screen.width,
        screen_height: screen.height,
        cpu_count: navigator.hardwareConcurrency
    };
}