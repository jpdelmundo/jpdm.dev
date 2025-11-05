//replaced with zustand (authStore.ts)
// import { createContext, useContext } from "react";
// //import { type Jwt } from '@shared/types/Jwt';

// //type JwtUser = Omit<Jwt, 'iat' | 'exp'>;

// interface AuthContextType {
//     token: string | null;
//     isAuthenticated: boolean;
//     login: (token: string) => void;
//     logout: () => void;
// }

// export const AuthContext = createContext<AuthContextType | null>(null);

// export const useAuth = () => {
//     const ctx = useContext(AuthContext);
//     if (!ctx) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return ctx;
// }