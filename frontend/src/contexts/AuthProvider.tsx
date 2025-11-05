//replaced with zustand (authStore.ts)
// import { getNewToken } from '@/auth/tokenManager';
// import { getAccessToken, registerTokenSetter, setAccessToken, setIsSecureAuth } from '@/auth/tokenStore';
// import { type TokenUserData } from '@shared/types/Jwt';
// import { jwtDecode } from 'jwt-decode';
// import { useEffect, useState, type ReactNode } from "react";
// import { AuthContext } from './AuthContext';

// export const AuthProvider = ({ secure, children }: { secure?: boolean, children: ReactNode }) => {
//     console.log('AuthProvider render');
//     const [token, setToken] = useState<string | null>(null);

//     // const setTokenAndSync = (token: string | null)=>{
//     //     setToken(token); //React component token
//     //     setAccessToken(token, secure); //token for backend use
//     // }

//     useEffect(() => {
//         if (secure) {
//             setIsSecureAuth(true);
//             const tryRefreshToken = async () => {
//                 try {
//                     const newToken = await getNewToken();
//                     setAccessToken(newToken);
//                 } catch (error) {
//                     console.log('Refresh failed:', error);
//                     setAccessToken(null);
//                 }
//             }

//             tryRefreshToken();
//         } else {
//             //get from localStorage
//             const savedToken = getAccessToken();
//             if (savedToken) {
//                 setAccessToken(savedToken);

//                 try {
//                     const tokenUserData = jwtDecode<TokenUserData>(savedToken);
//                     if (!tokenUserData.id) throw new Error('Missing id in token');
//                 } catch (error) {
//                     setAccessToken(null);
//                     console.error('Error in parsing token', error);
//                 }
//             }
//         }

//         registerTokenSetter(setToken);
//     }, [secure]);

//     const login = (jwt: string) => {
//         setAccessToken(jwt);
//     }

//     const logout = () => {
//         setAccessToken(null);
//     }

//     return (
//         <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }