/** Saves a file the app received (a PDF) as a download. */
export function saveFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Some browsers read the file after click() returns.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
