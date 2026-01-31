import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>

        {/* Preload fonts w/o blocking page rendering - basically browser keeps rendering instead of waiting for CSS to finish, optimizng performance*/}
        <link 
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap"
        />
        <link 
          rel="preload"
          as="style"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
          integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        
        {/* Convert to stylesheet and applies fonts*/}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.querySelectorAll('link[rel="preload"][as="style"]').forEach(function(link) {
                link.rel = 'stylesheet';
              });
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
