import usersJson from '../../data/users.json';

export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
}

/**
 * Mock data, imported from a JSON file in this app's own source
 * (tsconfig "resolveJsonModule"). It is bundled with the code, so it works
 * the same no matter which origin the page is served from.
 */
export const USERS: User[] = usersJson;
