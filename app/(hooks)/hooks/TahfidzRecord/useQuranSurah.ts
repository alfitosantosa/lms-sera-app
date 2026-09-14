"use client";
import { apiGet } from "@/lib/apiClients";
import { useQuery } from "@tanstack/react-query";

export type SurahQuranData = {
  id: string;
  name: string;
  nameLatin: string;
  verseCount: number;
  revelationPlace: string;
};

export const useGetQuranSurah = () => {
  return useQuery({
    queryKey: ["quranSurah"],
    queryFn: async () => {
      try {
        const response = await apiGet("/api/tahfidzrecord/surah");
        return response.data as SurahQuranData[];
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });
};
