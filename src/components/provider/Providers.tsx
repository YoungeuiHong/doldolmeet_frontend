"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { ThemeProvider } from "@mui/material";
import themes from "@/components/theme/DefaultColors";

const defaultQueryFn = async ({ queryKey }) => {
  const { data } = await axios.get(
    `https://api.doldolmeet.shop/${queryKey[0]}`,
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
