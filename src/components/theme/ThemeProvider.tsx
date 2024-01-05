"use client";
import React from "react";
import { ThemeProvider } from "@mui/material";
import themes from "@/components/theme/DefaultColors";

const CustomThemeProvider = ({ children }: React.PropsWithChildren) => {
  const theme = themes();

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default CustomThemeProvider;
