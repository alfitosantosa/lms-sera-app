// src/types/index.ts

// Kita gunakan Generic <T> berjaga-jaga jika action mengembalikan data
export type ActionResponse<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};
