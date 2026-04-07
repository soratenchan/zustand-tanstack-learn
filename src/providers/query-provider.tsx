"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // 学習ポイント 18: QueryClient を useState で作る理由
  // App Routerでは各リクエストで新しいQueryClientを作る必要がある。
  // モジュールスコープで作るとリクエスト間でキャッシュが共有されてしまう。
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 学習ポイント 19: デフォルトオプション
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 学習ポイント 20: DevToolsでクエリの状態を可視化 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
