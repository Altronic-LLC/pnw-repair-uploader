import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ImagePreviewModal } from "./ImagePreviewModal";
import type { LibraryFile } from "@/types/library";

function renderWithClient(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

const imageFile: LibraryFile = {
  id: "1",
  name: "intake-front.jpg",
  size: 1000,
  lastModified: "2026-06-24T00:00:00Z",
};

describe("ImagePreviewModal (mock mode)", () => {
  it("shows the file name and a demo-mode placeholder when there are no bytes", async () => {
    renderWithClient(<ImagePreviewModal file={imageFile} onClose={vi.fn()} />);
    expect(screen.getByText("intake-front.jpg")).toBeInTheDocument();
    // fetchFileBlob returns null in mock → placeholder appears once the query settles.
    expect(await screen.findByText(/preview isn’t available in demo mode/i)).toBeInTheDocument();
  });

  it("never offers a link out to SharePoint, even when the file has a webUrl", () => {
    renderWithClient(
      <ImagePreviewModal
        file={{ ...imageFile, webUrl: "https://example.sharepoint.com/x.jpg" }}
        onClose={vi.fn()}
      />,
    );
    // The kiosk stays self-contained — viewing happens in-app, nothing opens SharePoint.
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
