import { Html, Head, Main, NextScript } from "next/document";
import React from "react";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <title>DOLDOLMEET</title>
        <meta
          property="og:description"
          content="돌아가며 만나는 나의 아이돌, 돌돌밋"
          key="description"
        />
      </Head>
      <body style={{ backgroundColor: "#F8F8F8" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
