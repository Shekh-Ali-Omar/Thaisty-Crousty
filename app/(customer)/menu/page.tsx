import { Suspense } from "react";
import { MenuContent } from "./menu-content";
import MenuLoading from "./loading";

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuLoading />}>
      <MenuContent />
    </Suspense>
  );
}
