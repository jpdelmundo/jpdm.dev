import type { DeviceFingerprint } from '@shared/types/DeviceFingerprint';
import { UAParser } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';

export const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        //deviceId = crypto.randomUUID();
        deviceId = uuidv4();
        localStorage.setItem('device_id', deviceId);
    }

    return deviceId;
}

export const getFingerprint = (): DeviceFingerprint => {
    const ua = new UAParser().getResult();
    return {
        device_id: getDeviceId(),
        client_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen_width: screen.width,
        screen_height: screen.height,
        cpu_count: navigator.hardwareConcurrency,
        os: `${ua.os.name} ${ua.os.version}`.trim(),
        client: `${ua.browser.name} ${ua.browser.version}`.trim(),
        device: `${ua.device.vendor || ''} ${ua.device.model || ''}`.trim(),
        device_type: ua.device.type
    };
}