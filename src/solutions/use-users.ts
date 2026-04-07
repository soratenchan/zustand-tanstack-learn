"use client";

import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: async (): Promise<User[]> => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    // ユーザーリストはほとんど変わらないので長めのstaleTime
    staleTime: 10 * 60 * 1000,
  });
}
