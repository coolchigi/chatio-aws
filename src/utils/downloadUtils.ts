import JSZip from 'jszip';

export async function downloadZip(files: Record<string, string>, filename: string): Promise<void> {
  const zip = new JSZip();
  
  // Add each file to the zip
  Object.entries(files).forEach(([filePath, content]) => {
    zip.file(filePath, content);
  });
  
  // Generate the zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  // Create download link and trigger download
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  URL.revokeObjectURL(url);
}