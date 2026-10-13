import AppRouter from "./router/AppRouter";
import SiteChrome, { SiteFooter } from "./components/SiteChrome";

export default function App() {
  return (
    <>
      <SiteChrome />
      <AppRouter />
      <SiteFooter />
    </>
  );
}
