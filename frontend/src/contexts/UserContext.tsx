//replaced by zustand (authStore.ts)
// import { createContext, useContext } from 'react';
// import type { UserContextType } from './UserProvider';

// export const UserContext = createContext<UserContextType | null>(null);

// export const useUser = () => {
//     console.log({ UserContext });
//     const ctx = useContext(UserContext);
//     if (!ctx) {
//         throw new Error("useUser must be used within an UserProvider");
//     }
//     return ctx;
// }