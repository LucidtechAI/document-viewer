function initiateDownload(uri: string, filename: string): void {
  const a = document.createElement('a');
  a.setAttribute('href', uri);
  a.setAttribute('style', 'display: none;');
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(uri);
  a.remove();
}

export function useDownload(fileName: string, dataUri: string): () => void {
  return () => initiateDownload(dataUri, fileName);
}
