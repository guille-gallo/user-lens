import { userService, type User } from './userService';

/**
 * Mock data fallback when API is unavailable
 * This data should match the JSONPlaceholder API structure
 */
const MOCK_USERS: User[] = [
  {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
    email: "Sincere@april.biz",
    address: {
      street: "Kulas Light",
      suite: "Apt. 556",
      city: "Gwenborough",
      zipcode: "92998-3874",
      geo: {
        lat: "-37.3159",
        lng: "81.1496"
      }
    },
    phone: "1-770-736-8031 x56442",
    website: "hildegard.org",
    company: {
      name: "Romaguera-Crona",
      catchPhrase: "Multi-layered client-server neural-net",
      bs: "harness real-time e-markets"
    }
  },
  {
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "Shanna@melissa.tv",
    address: {
      street: "Victor Plains",
      suite: "Suite 879",
      city: "Wisokyburgh",
      zipcode: "90566-7771",
      geo: {
        lat: "-43.9509",
        lng: "-34.4618"
      }
    },
    phone: "010-692-6593 x09125",
    website: "anastasia.net",
    company: {
      name: "Deckow-Crist",
      catchPhrase: "Proactive didactic contingency",
      bs: "synergize scalable supply-chains"
    }
  },
  {
    id: 3,
    name: "Clementine Bauch",
    username: "Samantha",
    email: "Nathan@yesenia.net",
    address: {
      street: "Douglas Extension",
      suite: "Suite 847",
      city: "McKenziehaven",
      zipcode: "59590-4157",
      geo: {
        lat: "-68.6102",
        lng: "-47.0653"
      }
    },
    phone: "1-463-123-4447",
    website: "ramiro.info",
    company: {
      name: "Romaguera-Jacobson",
      catchPhrase: "Face to face bifurcated interface",
      bs: "e-enable strategic applications"
    }
  },
  {
    id: 4,
    name: "Patricia Lebsack",
    username: "Karianne",
    email: "Julianne.OConner@kory.org",
    address: {
      street: "Hoeger Mall",
      suite: "Apt. 692",
      city: "South Elvis",
      zipcode: "53919-4257",
      geo: {
        lat: "29.4572",
        lng: "-164.2990"
      }
    },
    phone: "493-170-9623 x156",
    website: "kale.biz",
    company: {
      name: "Robel-Corkery",
      catchPhrase: "Multi-tiered zero tolerance productivity",
      bs: "transition cutting-edge web services"
    }
  },
  {
    id: 5,
    name: "Chelsey Dietrich",
    username: "Kamren",
    email: "Lucio_Hettinger@annie.ca",
    address: {
      street: "Skiles Walks",
      suite: "Suite 351",
      city: "Roscoeview",
      zipcode: "33263",
      geo: {
        lat: "-31.8129",
        lng: "62.5342"
      }
    },
    phone: "(254)954-1289",
    website: "demarco.info",
    company: {
      name: "Keebler LLC",
      catchPhrase: "User-centric fault-tolerant solution",
      bs: "revolutionize end-to-end systems"
    }
  },
  {
    id: 6,
    name: "Mrs. Dennis Schulist",
    username: "Leopoldo_Corkery",
    email: "Karley_Dach@jasper.info",
    address: {
      street: "Norberto Crossing",
      suite: "Apt. 950",
      city: "South Christy",
      zipcode: "23505-1337",
      geo: {
        lat: "-71.4197",
        lng: "71.7478"
      }
    },
    phone: "1-477-935-8478 x6430",
    website: "ola.org",
    company: {
      name: "Considine-Lockman",
      catchPhrase: "Synchronised bottom-line interface",
      bs: "e-enable innovative applications"
    }
  },
  {
    id: 7,
    name: "Kurtis Weissnat",
    username: "Elwyn.Skiles",
    email: "Telly.Hoeger@billy.biz",
    address: {
      street: "Rex Trail",
      suite: "Suite 280",
      city: "Howemouth",
      zipcode: "58804-1099",
      geo: {
        lat: "24.8918",
        lng: "21.8984"
      }
    },
    phone: "210.067.6132",
    website: "elvis.io",
    company: {
      name: "Johns Group",
      catchPhrase: "Configurable multimedia task-force",
      bs: "generate enterprise e-tailers"
    }
  },
  {
    id: 8,
    name: "Nicholas Runolfsdottir V",
    username: "Maxime_Nienow",
    email: "Sherwood@rosamond.me",
    address: {
      street: "Ellsworth Summit",
      suite: "Suite 729",
      city: "Aliyaview",
      zipcode: "45169",
      geo: {
        lat: "-14.3990",
        lng: "-120.7677"
      }
    },
    phone: "586.493.6943 x140",
    website: "jacynthe.com",
    company: {
      name: "Abernathy Group",
      catchPhrase: "Implemented secondary concept",
      bs: "e-enable extensible e-tailers"
    }
  },
  {
    id: 9,
    name: "Glenna Reichert",
    username: "Delphine",
    email: "Chaim_McDermott@dana.io",
    address: {
      street: "Dayna Park",
      suite: "Suite 449",
      city: "Bartholomebury",
      zipcode: "76495-3109",
      geo: {
        lat: "24.6463",
        lng: "-168.8889"
      }
    },
    phone: "(775)976-6794 x41206",
    website: "conrad.com",
    company: {
      name: "Yost and Sons",
      catchPhrase: "Switchable contextually-based project",
      bs: "aggregate real-time technologies"
    }
  },
  {
    id: 10,
    name: "Clementina DuBuque",
    username: "Moriah.Stanton",
    email: "Rey.Padberg@karina.biz",
    address: {
      street: "Kattie Turnpike",
      suite: "Suite 198",
      city: "Lebsackbury",
      zipcode: "31428-2261",
      geo: {
        lat: "-38.2386",
        lng: "57.2232"
      }
    },
    phone: "024-648-3804",
    website: "ambrose.net",
    company: {
      name: "Hoeger LLC",
      catchPhrase: "Centralized empowering task-force",
      bs: "target end-to-end models"
    }
  }
];

/**
 * Local storage utilities for caching data
 */
const STORAGE_KEYS = {
  USERS: 'user-lens-users-cache',
  LAST_FETCH: 'user-lens-last-fetch'
} as const;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Data service with fallback strategy:
 * 1. Try to fetch from API
 * 2. If API fails, check localStorage cache
 * 3. If no cache or cache expired, use mock data
 * 4. Always cache successful API responses
 */
export const dataService = {
  /**
   * Get all users with fallback strategy
   */
  getUsers: async (): Promise<User[]> => {
    try {
      console.log('🌐 Attempting to fetch users from API...');
      const users = await userService.getUsers();
      
      // Cache successful response
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.LAST_FETCH, Date.now().toString());
      
      console.log('✅ Successfully fetched and cached users from API');
      return users;
    } catch (error) {
      console.warn('⚠️ API request failed:', (error as Error).message);
      
      // Try to get cached data
      const cachedUsers = getCachedUsers();
      if (cachedUsers) {
        console.log('💾 Using cached users from localStorage');
        return cachedUsers;
      }
      
      // Fallback to mock data
      console.log('🎭 Using mock data as fallback');
      return MOCK_USERS;
    }
  },

  /**
   * Get user by ID with fallback strategy
   */
  getUserById: async (id: number): Promise<User> => {
    try {
      console.log(`🌐 Attempting to fetch user ${id} from API...`);
      const user = await userService.getUserById(id);
      console.log(`✅ Successfully fetched user ${id} from API`);
      return user;
    } catch (error) {
      console.warn(`⚠️ API request failed for user ${id}:`, (error as Error).message);
      
      // Try to find user in cached data
      const cachedUsers = getCachedUsers();
      if (cachedUsers) {
        const cachedUser = cachedUsers.find(u => u.id === id);
        if (cachedUser) {
          console.log(`💾 Using cached user ${id} from localStorage`);
          return cachedUser;
        }
      }
      
      // Fallback to mock data
      const mockUser = MOCK_USERS.find(u => u.id === id);
      if (mockUser) {
        console.log(`🎭 Using mock data for user ${id}`);
        return mockUser;
      }
      
      throw new Error(`User with ID ${id} not found in any data source`);
    }
  },

  /**
   * Create user (delegates to userService for now)
   */
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    return userService.createUser(userData);
  },

  /**
   * Update user (delegates to userService for now)
   */
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    return userService.updateUser(id, userData);
  },

  /**
   * Delete user (delegates to userService for now)
   */
  deleteUser: async (id: number): Promise<void> => {
    return userService.deleteUser(id);
  },

  /**
   * Clear cached data (useful for testing or manual refresh)
   */
  clearCache: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.LAST_FETCH);
    console.log('🗑️ Cache cleared');
  }
};

/**
 * Get cached users if they exist and are not expired
 */
function getCachedUsers(): User[] | null {
  try {
    const cachedData = localStorage.getItem(STORAGE_KEYS.USERS);
    const lastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH);
    
    if (!cachedData || !lastFetch) {
      return null;
    }
    
    const cacheAge = Date.now() - parseInt(lastFetch);
    if (cacheAge > CACHE_DURATION) {
      console.log('💾 Cache expired, removing...');
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.LAST_FETCH);
      return null;
    }
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.warn('💾 Error reading cache:', error);
    return null;
  }
}
