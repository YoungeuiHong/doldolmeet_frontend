import React from "react";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AuthContext from "@/components/provider/AuthProvider";
import Header from "@/components/header/Header";
import { Grid } from "@mui/material";
import CustomThemeProvider from "@/components/theme/ThemeProvider";

export default function MyApp({ Component, pageProps }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <div style={{ backgroundColor: "#F8F8F8" }}>
      <AuthContext>
        <CustomThemeProvider>
          <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={pageProps.dehydratedState}>
              <Header />
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                maxWidth="xl"
                sx={{
                  mx: "auto",
                  width: "100%",
                  paddingTop: 10,
                  minHeight: "98vh",
                }}
              >
                <Component {...pageProps} />
              </Grid>
            </HydrationBoundary>
            <ReactQueryDevtools initialIsOpen={true} />
          </QueryClientProvider>
        </CustomThemeProvider>
      </AuthContext>
    </div>
  );
}
