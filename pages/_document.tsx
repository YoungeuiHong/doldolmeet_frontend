import { Html, Head, Main, NextScript } from "next/document";
import React from "react";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <title>DOLDOLMEET</title>
      </Head>
      <body style={{ backgroundColor: "#F8F8F8" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
