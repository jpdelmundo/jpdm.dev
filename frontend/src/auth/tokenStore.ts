//replaced with zustand (authStore.ts)
// type AccessToken = string | null;
// let accessToken: AccessToken = null;
// let onTokenChange: ((token: AccessToken) => void) | null = null;
// let isSecure = false;

// export const setIsSecureAuth = (secure: boolean) => {
//     isSecure = secure;
// }

// export const setAccessToken = (token: AccessToken) => {
//     if (isSecure) {
//         accessToken = token;
//     } else {
//         token ? localStorage.setItem('token', token) : localStorage.removeItem('token');
//     }
//     onTokenChange && onTokenChange(token);
// }
// export const getAccessToken = () => isSecure ? accessToken : localStorage.getItem('token');

// export const registerTokenSetter = (fn: (token: AccessToken) => void) => {
//     onTokenChange = fn;
// }