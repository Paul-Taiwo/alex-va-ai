import "regenerator-runtime/runtime";
import type { AppProps } from "next/app";
import { ThemeProvider, DefaultTheme } from "styled-components";
import GlobalStyle from "@/styles/globalstyles";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";

const theme: DefaultTheme = {
  colors: {
    primary: "#111",
    secondary: "#0070f3",
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Alex - VA</title>
        <meta name='description' content='Alex - VA' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
