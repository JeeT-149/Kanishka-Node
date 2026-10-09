import { useEffect } from "react";

/**
 * Sets document title dynamically per-page and restores on unmount.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | Kiln & Leaf` : "Kiln & Leaf Roasters";

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
