//replaced by zustand (authStore.ts)
// import type UserProfile from '@shared/models/generated/UserProfile';
// import type { TokenUserData } from '@shared/types/Jwt';
// import { jwtDecode } from 'jwt-decode';
// import { useEffect, useState, type ReactNode } from 'react';
// import { apiGet } from '../api/apiClient';
// import { useAuth } from './AuthContext';
// import { UserContext } from './UserContext';

// type CurrentUser = TokenUserData & { profile?: UserProfile; };

// export interface UserContextType {
// 	user?: CurrentUser;
// 	isLoading: boolean;
// }

// export const UserProvider = ({ children }: { children: ReactNode }) => {
// 	console.log('UserProvider render');
// 	const auth = useAuth();
// 	const [user, setUser] = useState<UserContextType | null>({ isLoading: true });
// 	const [isLoading, setIsLoading] = useState(true);

// 	useEffect(() => {
// 		const fetchData = async () => {
// 			try {
// 				if (auth.token) {
// 					const tokenUserData = jwtDecode<TokenUserData>(auth.token);
// 					console.log('UserProvider user:', tokenUserData);
// 					if (tokenUserData) {
// 						const user: CurrentUser = tokenUserData;
// 						const result = await apiGet<UserProfile>('/user/profile');
// 						if (result.ok) {
// 							result.tokenUserData && (user.profile = result.tokenUserData);
// 						}
// 						setUser({ user, isLoading });
// 					}
// 				}
// 			} finally {
// 				setIsLoading(false);
// 			}
// 		}

// 		fetchData();
// 	}, [auth.token]);

// 	return (
// 		<UserContext.Provider value={user}>
// 			{children}
// 		</UserContext.Provider>
// 	);
// }