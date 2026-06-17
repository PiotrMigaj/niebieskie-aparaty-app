export function triggerDownload(endpointPath: string): void {
  const a = document.createElement("a");
  a.href = endpointPath;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
