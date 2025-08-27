import * as XLSX from 'xlsx';

export interface XLSXContent {
  url: string;
  title: string;
}

export const parseXLSXFile = async (file: File): Promise<XLSXContent[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const contents: XLSXContent[] = [];
        
        // Skip the header row (index 0) and start from row 2 (index 1)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 2 && row[0] && row[1]) {
            let url = row[0].toString().trim();
            const title = row[1].toString().trim();
            
            // Extract video URL if it's an embedded format
            if (url.includes('eduverseplay?videoUrl=')) {
              const urlParams = new URLSearchParams(url.split('?')[1]);
              const videoUrl = urlParams.get('videoUrl');
              if (videoUrl) {
                url = decodeURIComponent(videoUrl);
              }
            }
            
            contents.push({ url, title });
          }
        }
        
        resolve(contents);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const processFolderStructure = async (files: FileList): Promise<any> => {
  const batches: any = {};
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const pathParts = file.webkitRelativePath.split('/');
    
    if (pathParts.length >= 3 && file.name.endsWith('.xlsx')) {
      const batchName = pathParts[0];
      const subjectName = pathParts[1];
      const fileName = file.name.replace('.xlsx', '');
      
      if (!batches[batchName]) {
        batches[batchName] = {
          name: batchName,
          subjects: {}
        };
      }
      
      if (!batches[batchName].subjects[subjectName]) {
        batches[batchName].subjects[subjectName] = {
          name: subjectName,
          sections: {}
        };
      }
      
      try {
        const contents = await parseXLSXFile(file);
        batches[batchName].subjects[subjectName].sections[fileName] = {
          name: fileName,
          type: fileName.toLowerCase().includes('video') ? 'video' : 
                fileName.toLowerCase().includes('notes') ? 'notes' :
                fileName.toLowerCase().includes('dpp') || fileName.toLowerCase().includes('acp') || 
                fileName.toLowerCase().includes('wpp') || fileName.toLowerCase().includes('otp') ? 'assignment' : 'notes',
          contents
        };
      } catch (error) {
        console.error(`Failed to parse ${file.name}:`, error);
      }
    }
  }
  
  return batches;
};
