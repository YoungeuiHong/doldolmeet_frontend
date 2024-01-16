"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { ThemeProvider } from "@mui/material";
import themes from "@/components/theme/DefaultColors";

const defaultQueryFn = async ({ queryKey }) => {
  const { data } = await axios.get(
    `https://api.doldolmeet.store/${queryKey[0]}`,
  );
  return data;
};
const Providers = ({ children }: React.PropsWithChildren) => {
  const theme = themes();

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            queryFn: defaultQueryFn,
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
};

export default Providers;
