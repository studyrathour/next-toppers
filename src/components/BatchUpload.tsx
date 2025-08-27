import React, { useState, useRef } from 'react';
import { Upload, FolderOpen, FileSpreadsheet, Eye, Plus } from 'lucide-react';
import { processFolderStructure } from '../utils/xlsxParser';
import { firebaseService } from '../services/firebase';
import SkeletonLoader from './SkeletonLoader';
import toast from 'react-hot-toast';

const BatchUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const batchStructure = await processFolderStructure(files);
      setPreviewData(batchStructure);
      setShowPreview(true);
      toast.success('Folder structure processed successfully!');
    } catch (error) {
      toast.error('Failed to process folder structure');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadToFirebase = async () => {
    if (!previewData) return;

    setIsUploading(true);
    try {
      for (const batchName of Object.keys(previewData)) {
        const batchData = previewData[batchName];
        
        // Convert subjects object to array format
        const subjects = Object.keys(batchData.subjects).map(subjectName => ({
          id: Math.random().toString(36).substr(2, 9),
          name: subjectName,
          thumbnail: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=400',
          sections: Object.keys(batchData.subjects[subjectName].sections).map(sectionName => ({
            id: Math.random().toString(36).substr(2, 9),
            name: sectionName,
            type: batchData.subjects[subjectName].sections[sectionName].type,
            contents: batchData.subjects[subjectName].sections[sectionName].contents.map((content: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              title: content.title,
              url: content.url,
              type: batchData.subjects[subjectName].sections[sectionName].type,
              thumbnail: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=400'
            }))
          }))
        }));

        await firebaseService.addBatch({
          name: batchData.name,
          description: `Automatically created batch from folder: ${batchData.name}`,
          thumbnail: 'https://images.pexels.com/photos/5427656/pexels-photo-5427656.jpeg?auto=compress&cs=tinysrgb&w=800',
          subjects,
          layout: 'standard-grid'
        });
      }

      toast.success('All batches uploaded successfully!');
      setPreviewData(null);
      setShowPreview(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload batches to Firebase');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-lg p-8 border border-secondary">
      <h2 className="text-2xl font-bold text-text-primary mb-8 flex items-center gap-3">
        <Upload className="w-7 h-7 text-primary" />
        Batch Upload
      </h2>

      <div className="space-y-8">
        {/* Folder Upload */}
        <div>
          <label className="block text-lg font-medium text-text-secondary mb-4">
            Upload Batch Folder
          </label>
          <div className="border-2 border-dashed border-secondary rounded-xl p-12 text-center hover:border-primary transition-all duration-300 hover:bg-primary/5">
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              multiple
              onChange={handleFolderUpload}
              className="hidden"
              id="folderUpload"
              disabled={isProcessing}
            />
            <label htmlFor="folderUpload" className={`cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <FolderOpen className="w-16 h-16 text-text-tertiary mx-auto mb-6" />
              <p className="text-xl font-medium text-text-secondary mb-3">
                {isProcessing ? 'Processing Folder...' : 'Select Batch Folder'}
              </p>
              <p className="text-text-tertiary">
                Choose a folder containing subjects with XLSX files
              </p>
              {isProcessing && (
                <div className="mt-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && previewData && (
          <div className="border border-secondary rounded-xl p-6 bg-background">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                Preview Structure
              </h3>
              <button
                onClick={handleUploadToFirebase}
                disabled={isUploading}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 disabled:opacity-50 flex items-center gap-2 font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Upload to Firebase
                  </>
                )}
              </button>
            </div>

            {isUploading ? (
              <SkeletonLoader type="card" count={3} />
            ) : (
              <div className="space-y-6">
                {Object.keys(previewData).map((batchName) => (
                  <div key={batchName} className="bg-surface rounded-lg p-6 border border-secondary">
                    <h4 className="font-semibold text-xl text-text-primary mb-4 flex items-center gap-2">
                      📚 Batch: {batchName}
                    </h4>
                    <div className="space-y-4">
                      {Object.keys(previewData[batchName].subjects).map((subjectName) => (
                        <div key={subjectName} className="bg-background rounded-lg p-4 border border-secondary">
                          <h5 className="font-medium text-lg text-text-secondary mb-3 flex items-center gap-2">
                            📖 Subject: {subjectName}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.keys(previewData[batchName].subjects[subjectName].sections).map((sectionName) => {
                              const section = previewData[batchName].subjects[subjectName].sections[sectionName];
                              return (
                                <div key={sectionName} className="bg-surface rounded-lg p-3 border border-secondary hover:border-primary/50 transition-colors">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileSpreadsheet className="w-5 h-5 text-green-400" />
                                    <span className="font-medium text-text-primary">{sectionName}</span>
                                  </div>
                                  <p className="text-sm text-text-tertiary">
                                    {section.contents?.length || 0} items • {section.type}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchUpload;