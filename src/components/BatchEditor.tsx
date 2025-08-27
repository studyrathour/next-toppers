import React, { useState, useEffect } from 'react';
import { produce } from 'immer';
import { Save, X, Plus, Trash2, ArrowLeft, ImagePlus, Upload, Check, Image } from 'lucide-react';
import { Batch, Subject, Section, Content } from '../types';
import { firebaseService } from '../services/firebase';
import { ThumbnailSelector } from './ThumbnailSelector';
import toast from 'react-hot-toast';

interface BatchEditorProps {
  batchToEdit: Batch | null;
  onClose: () => void;
}

const NEW_BATCH_TEMPLATE: Omit<Batch, 'id' | 'createdAt' | 'isActive' | 'enrolledStudents'> = {
  name: '',
  description: '',
  thumbnail: 'https://images.pexels.com/photos/5427656/pexels-photo-5427656.jpeg?auto=compress&cs=tinysrgb&w=800',
  subjects: [],
  layout: 'standard-grid',
};

const layoutOptions = [
  { id: 'standard-grid', name: 'Standard Grid' },
  { id: 'horizontal-list', name: 'Horizontal List' },
  { id: 'overlay-grid', name: 'Overlay Grid' },
  { id: 'alternating-list', name: 'Alternating List' },
];

type ViewLevel = 'batch' | 'subjects' | 'sections' | 'contents';

const BatchEditor: React.FC<BatchEditorProps> = ({ batchToEdit, onClose }) => {
  const [batchData, setBatchData] = useState<Omit<Batch, 'id'>>(
    () => batchToEdit || { ...NEW_BATCH_TEMPLATE, createdAt: new Date(), isActive: true, enrolledStudents: 0 }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewLevel>('batch');
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number | null>(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [selectedContents, setSelectedContents] = useState<Set<string>>(new Set());
  const [bulkThumbnailUrl, setBulkThumbnailUrl] = useState('');
  const [showBulkThumbnail, setShowBulkThumbnail] = useState(false);
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);
  const [thumbnailSelectorContext, setThumbnailSelectorContext] = useState<{
    type: 'batch' | 'subject' | 'content' | 'bulk';
    path?: (string | number)[];
    currentUrl: string;
  } | null>(null);

  useEffect(() => {
    if (batchToEdit) {
      setBatchData(batchToEdit);
    } else {
      setBatchData({ ...NEW_BATCH_TEMPLATE, createdAt: new Date(), isActive: true, enrolledStudents: 0 });
    }
  }, [batchToEdit]);

  const handleBatchChange = (field: keyof Batch, value: string) => {
    setBatchData(produce(draft => {
      (draft as any)[field] = value;
    }));
  };

  const handleNestedChange = (path: (string | number)[], value: any) => {
    setBatchData(produce(draft => {
      let current: any = draft;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      
      // Auto-update content thumbnails when subject thumbnail changes
      if (path.length === 3 && path[0] === 'subjects' && path[2] === 'thumbnail') {
        const subjectIndex = path[1] as number;
        draft.subjects[subjectIndex].sections.forEach(section => {
          section.contents.forEach(content => {
            content.thumbnail = value;
          });
        });
      }
    }));
  };

  const addSubject = () => {
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Subject',
      thumbnail: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=400',
      sections: [],
    };
    setBatchData(produce(draft => {
      draft.subjects.push(newSubject);
    }));
  };

  const deleteSubject = (subjectIndex: number) => {
    if (window.confirm('Are you sure you want to delete this subject and all its content?')) {
      setBatchData(produce(draft => {
        draft.subjects.splice(subjectIndex, 1);
      }));
      if (selectedSubjectIndex === subjectIndex) {
        setCurrentView('subjects');
        setSelectedSubjectIndex(null);
      }
    }
  };
  
  const addSection = (subjectIndex: number) => {
    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Section',
      type: 'video',
      contents: [],
    };
    setBatchData(produce(draft => {
      draft.subjects[subjectIndex].sections.push(newSection);
    }));
  };

  const deleteSection = (subjectIndex: number, sectionIndex: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      setBatchData(produce(draft => {
        draft.subjects[subjectIndex].sections.splice(sectionIndex, 1);
      }));
      if (selectedSectionIndex === sectionIndex) {
        setCurrentView('sections');
        setSelectedSectionIndex(null);
      }
    }
  };

  const addContent = (subjectIndex: number, sectionIndex: number) => {
    const subject = batchData.subjects[subjectIndex];
    const newContent: Content = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Content',
      url: '',
      type: batchData.subjects[subjectIndex].sections[sectionIndex].type,
      thumbnail: subject.thumbnail,
    };
    setBatchData(produce(draft => {
      draft.subjects[subjectIndex].sections[sectionIndex].contents.push(newContent);
    }));
  };

  const deleteContent = (subjectIndex: number, sectionIndex: number, contentIndex: number) => {
    setBatchData(produce(draft => {
      draft.subjects[subjectIndex].sections[sectionIndex].contents.splice(contentIndex, 1);
    }));
  };

  const handleContentSelection = (contentId: string) => {
    setSelectedContents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const applyBulkThumbnail = () => {
    if (!bulkThumbnailUrl.trim() || selectedContents.size === 0) {
      toast.error('Please enter a thumbnail URL and select content items');
      return;
    }

    setBatchData(produce(draft => {
      draft.subjects.forEach((subject, sIdx) => {
        subject.sections.forEach((section, secIdx) => {
          section.contents.forEach((content, cIdx) => {
            if (selectedContents.has(content.id)) {
              content.thumbnail = bulkThumbnailUrl.trim();
            }
          });
        });
      });
    }));

    setSelectedContents(new Set());
    setBulkThumbnailUrl('');
    setShowBulkThumbnail(false);
    toast.success(`Updated ${selectedContents.size} thumbnails!`);
  };

  const getTotalContentCount = (subjectIndex: number) => {
    return batchData.subjects[subjectIndex]?.sections.reduce((total, section) => {
      return total + (section.contents?.length || 0);
    }, 0) || 0;
  };

  const openThumbnailSelector = (type: 'batch' | 'subject' | 'content' | 'bulk', currentUrl: string, path?: (string | number)[]) => {
    setThumbnailSelectorContext({ type, path, currentUrl });
    setShowThumbnailSelector(true);
  };

  const handleThumbnailSelect = (url: string) => {
    if (!thumbnailSelectorContext) return;

    const { type, path } = thumbnailSelectorContext;

    if (type === 'batch') {
      handleBatchChange('thumbnail', url);
    } else if (type === 'bulk') {
      setBulkThumbnailUrl(url);
    } else if (path) {
      handleNestedChange(path, url);
      
      // If updating subject thumbnail, automatically update all content thumbnails in that subject
      if (type === 'subject' && path.length === 3 && path[0] === 'subjects') {
        const subjectIndex = path[1] as number;
        setBatchData(produce(draft => {
          draft.subjects[subjectIndex].sections.forEach(section => {
            section.contents.forEach(content => {
              content.thumbnail = url;
            });
          });
        }));
        toast.success(`Subject thumbnail updated! All ${getTotalContentCount(subjectIndex)} content items now use this thumbnail.`);
      }
    }

    setShowThumbnailSelector(false);
    setThumbnailSelectorContext(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (batchToEdit) {
        await firebaseService.updateBatch(batchToEdit.id, batchData);
        toast.success('Batch updated successfully!');
      } else {
        await firebaseService.addBatch(batchData);
        toast.success('Batch created successfully!');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save batch.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSubjects = () => {
    setCurrentView('subjects');
    setSelectedSubjectIndex(null);
    setSelectedSectionIndex(null);
  };

  const navigateToSections = (subjectIndex: number) => {
    setCurrentView('sections');
    setSelectedSubjectIndex(subjectIndex);
    setSelectedSectionIndex(null);
  };

  const navigateToContents = (sectionIndex: number) => {
    setCurrentView('contents');
    setSelectedSectionIndex(sectionIndex);
  };

  const renderBreadcrumb = () => {
    const items = [];
    
    items.push(
      <button
        key="batch"
        onClick={() => setCurrentView('batch')}
        className={`text-sm ${currentView === 'batch' ? 'text-primary font-medium' : 'text-text-secondary hover:text-text-primary'}`}
      >
        Batch Details
      </button>
    );

    if (currentView !== 'batch') {
      items.push(<span key="sep1" className="text-text-tertiary mx-2">/</span>);
      items.push(
        <button
          key="subjects"
          onClick={navigateToSubjects}
          className={`text-sm ${currentView === 'subjects' ? 'text-primary font-medium' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Subjects
        </button>
      );
    }

    if (selectedSubjectIndex !== null && currentView !== 'subjects') {
      items.push(<span key="sep2" className="text-text-tertiary mx-2">/</span>);
      items.push(
        <button
          key="sections"
          onClick={() => navigateToSections(selectedSubjectIndex)}
          className={`text-sm ${currentView === 'sections' ? 'text-primary font-medium' : 'text-text-secondary hover:text-text-primary'}`}
        >
          {batchData.subjects[selectedSubjectIndex]?.name} Sections
        </button>
      );
    }

    if (selectedSectionIndex !== null && currentView === 'contents') {
      items.push(<span key="sep3" className="text-text-tertiary mx-2">/</span>);
      items.push(
        <span key="contents" className="text-sm text-primary font-medium">
          {batchData.subjects[selectedSubjectIndex!]?.sections[selectedSectionIndex]?.name} Contents
        </span>
      );
    }

    return <div className="flex items-center mb-6">{items}</div>;
  };

  const inputStyles = "w-full mt-1 p-3 border border-secondary rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all";
  const cardStyles = "bg-surface rounded-xl p-6 border border-secondary hover:border-primary/50 transition-all duration-300";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose} className="flex items-center gap-2 text-primary font-medium hover:brightness-125 transition">
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </button>
          <h1 className="text-3xl font-bold text-text-primary">
            {batchToEdit ? 'Edit Batch' : 'Create New Batch'}
          </h1>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 disabled:opacity-50 flex items-center gap-2 font-medium transition-all"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isLoading ? 'Saving...' : 'Save Batch'}
          </button>
        </div>

        {renderBreadcrumb()}

        {/* Bulk Thumbnail Modal */}
        {showBulkThumbnail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-xl p-6 max-w-md w-full mx-4 border border-secondary">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Update Selected Thumbnails</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={bulkThumbnailUrl}
                    onChange={(e) => setBulkThumbnailUrl(e.target.value)}
                    placeholder="Enter thumbnail URL"
                    className="flex-1 p-3 border border-secondary rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  <button
                    onClick={() => openThumbnailSelector('bulk', bulkThumbnailUrl)}
                    className="bg-secondary text-text-primary px-4 py-3 rounded-lg hover:bg-secondary/80 flex items-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    Browse
                  </button>
                </div>
                {bulkThumbnailUrl && (
                  <img
                    src={bulkThumbnailUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-secondary"
                  />
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={applyBulkThumbnail}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/80 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply to {selectedContents.size} items
                </button>
                <button
                  onClick={() => setShowBulkThumbnail(false)}
                  className="flex-1 bg-secondary text-text-primary py-2 px-4 rounded-lg hover:bg-secondary/80"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Thumbnail Selector Modal */}
        {showThumbnailSelector && thumbnailSelectorContext && (
          <ThumbnailSelector
            currentThumbnail={thumbnailSelectorContext.currentUrl}
            onSelect={handleThumbnailSelect}
            onClose={() => {
              setShowThumbnailSelector(false);
              setThumbnailSelectorContext(null);
            }}
            title="Select Thumbnail"
          />
        )}

        <div className="space-y-8">
          {currentView === 'batch' && (
            <div className={cardStyles}>
              <h2 className="text-2xl font-semibold text-text-primary mb-6">Batch Information</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Batch Name</label>
                  <input
                    type="text"
                    value={batchData.name}
                    onChange={(e) => handleBatchChange('name', e.target.value)}
                    className={inputStyles}
                    placeholder="Enter batch name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Layout Style</label>
                  <select
                    value={(batchData as Batch).layout || 'standard-grid'}
                    onChange={(e) => handleBatchChange('layout', e.target.value)}
                    className={inputStyles}
                  >
                    {layoutOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                  <textarea
                    value={batchData.description}
                    onChange={(e) => handleBatchChange('description', e.target.value)}
                    className={inputStyles}
                    rows={4}
                    placeholder="Enter batch description"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-2">Thumbnail URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={batchData.thumbnail}
                      onChange={(e) => handleBatchChange('thumbnail', e.target.value)}
                      className="flex-1 mt-1 p-3 border border-secondary rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Enter thumbnail URL"
                    />
                    <button
                      onClick={() => openThumbnailSelector('batch', batchData.thumbnail)}
                      className="mt-1 bg-secondary text-text-primary px-4 py-3 rounded-lg hover:bg-secondary/80 flex items-center gap-2"
                    >
                      <Image className="w-4 h-4" />
                      Browse
                    </button>
                    <button
                      onClick={() => {
                        const subjectThumbnail = selectedSubjectIndex !== null ? batchData.subjects[selectedSubjectIndex]?.thumbnail : '';
                        if (subjectThumbnail) {
                          setBulkThumbnailUrl(subjectThumbnail);
                          toast.success('Subject thumbnail loaded for bulk update!');
                        }
                      }}
                      className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 flex items-center gap-2"
                      title="Use subject thumbnail for bulk update"
                    >
                      <Image className="w-4 h-4" />
                      Subject
                    </button>
                  </div>
                  {batchData.thumbnail && (
                    <div className="mt-4">
                      <img
                        src={batchData.thumbnail}
                        alt="Batch thumbnail"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-secondary"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={navigateToSubjects}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 flex items-center gap-2"
                >
                  Manage Subjects
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {currentView === 'subjects' && (
            <div className={cardStyles}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-text-primary">Subjects</h2>
                <button
                  onClick={addSubject}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Subject
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batchData.subjects.map((subject, sIdx) => (
                  <div key={subject.id} className="bg-background rounded-lg border border-secondary overflow-hidden hover:border-primary/50 transition-all group">
                    <div className="relative">
                      <img
                        src={subject.thumbnail}
                        alt={subject.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg mb-1">{subject.name}</h3>
                        <p className="text-white/80 text-sm">{subject.sections?.length || 0} sections</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => handleNestedChange(['subjects', sIdx, 'name'], e.target.value)}
                        className="w-full p-2 mb-3 border border-secondary rounded bg-surface text-text-primary"
                        placeholder="Subject name"
                      />
                      <input
                        type="url"
                        value={subject.thumbnail}
                        onChange={(e) => handleNestedChange(['subjects', sIdx, 'thumbnail'], e.target.value)}
                        className="w-full p-2 mb-4 border border-secondary rounded bg-surface text-text-primary text-sm"
                        placeholder="Thumbnail URL"
                      />
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => openThumbnailSelector('subject', subject.thumbnail, ['subjects', sIdx, 'thumbnail'])}
                          className="flex-1 bg-indigo-500 text-white py-2 px-3 rounded hover:bg-indigo-600 text-sm flex items-center justify-center gap-1"
                        >
                          <Image className="w-3 h-3" />
                          Browse & Update All
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigateToSections(sIdx)}
                          className="flex-1 bg-primary text-white py-2 px-3 rounded hover:bg-primary/80 text-sm"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => deleteSubject(sIdx)}
                          className="bg-danger text-white p-2 rounded hover:bg-danger/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'sections' && selectedSubjectIndex !== null && (
            <div className={cardStyles}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-text-primary">
                  {batchData.subjects[selectedSubjectIndex]?.name} - Sections
                </h2>
                <button
                  onClick={() => addSection(selectedSubjectIndex)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batchData.subjects[selectedSubjectIndex]?.sections.map((section, secIdx) => (
                  <div key={section.id} className="bg-background rounded-lg border border-secondary p-4 hover:border-primary/50 transition-all">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          {section.type}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {section.contents?.length || 0} items
                        </span>
                      </div>
                      <h3 className="font-semibold text-text-primary">{section.name}</h3>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => handleNestedChange(['subjects', selectedSubjectIndex, 'sections', secIdx, 'name'], e.target.value)}
                        className="w-full p-2 border border-secondary rounded bg-surface text-text-primary"
                        placeholder="Section name"
                      />
                      <select
                        value={section.type}
                        onChange={(e) => handleNestedChange(['subjects', selectedSubjectIndex, 'sections', secIdx, 'type'], e.target.value)}
                        className="w-full p-2 border border-secondary rounded bg-surface text-text-primary"
                      >
                        <option value="video">Video</option>
                        <option value="notes">Notes</option>
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigateToContents(secIdx)}
                          className="flex-1 bg-primary text-white py-2 px-3 rounded hover:bg-primary/80 text-sm"
                        >
                          Contents
                        </button>
                        <button
                          onClick={() => deleteSection(selectedSubjectIndex, secIdx)}
                          className="bg-danger text-white p-2 rounded hover:bg-danger/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'contents' && selectedSubjectIndex !== null && selectedSectionIndex !== null && (
            <div className={cardStyles}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-text-primary">
                  {batchData.subjects[selectedSubjectIndex]?.sections[selectedSectionIndex]?.name} - Contents
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const subjectThumbnail = batchData.subjects[selectedSubjectIndex]?.thumbnail;
                      if (subjectThumbnail && selectedSubjectIndex !== null && selectedSectionIndex !== null) {
                        setBatchData(produce(draft => {
                          draft.subjects[selectedSubjectIndex].sections[selectedSectionIndex].contents.forEach(content => {
                            content.thumbnail = subjectThumbnail;
                          });
                        }));
                        const contentCount = batchData.subjects[selectedSubjectIndex]?.sections[selectedSectionIndex]?.contents.length || 0;
                        toast.success(`All ${contentCount} content thumbnails updated to match subject!`);
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    Use Subject Thumbnail
                  </button>
                  {selectedContents.size > 0 && (
                    <button
                      onClick={() => setShowBulkThumbnail(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <ImagePlus className="w-4 h-4" />
                      Update {selectedContents.size} Thumbnails
                    </button>
                  )}
                  <button
                    onClick={() => addContent(selectedSubjectIndex, selectedSectionIndex)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Content
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {batchData.subjects[selectedSubjectIndex]?.sections[selectedSectionIndex]?.contents.map((content, cIdx) => (
                   <div key={content.id} className="bg-background rounded-lg border border-secondary overflow-hidden hover:border-primary/50 transition-all group">
                     <div className="relative">
                       <input
                         type="checkbox"
                         checked={selectedContents.has(content.id)}
                         onChange={() => handleContentSelection(content.id)}
                         className="absolute top-2 left-2 z-10 w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                       />
                       <img
                         src={content.thumbnail || 'https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg?auto=compress&cs=tinysrgb&w=400'}
                         alt={content.title}
                         className="w-full h-32 object-cover"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                       <div className="absolute bottom-2 left-2 right-2">
                         <h4 className="text-white font-medium text-sm truncate">{content.title}</h4>
                       </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <input
                        type="text"
                        value={content.title}
                        onChange={(e) => handleNestedChange(['subjects', selectedSubjectIndex, 'sections', selectedSectionIndex, 'contents', cIdx, 'title'], e.target.value)}
                        className="w-full p-2 border border-secondary rounded bg-surface text-text-primary text-sm"
                        placeholder="Content title"
                      />
                      <input
                        type="url"
                        value={content.url}
                        onChange={(e) => handleNestedChange(['subjects', selectedSubjectIndex, 'sections', selectedSectionIndex, 'contents', cIdx, 'url'], e.target.value)}
                        className="w-full p-2 border border-secondary rounded bg-surface text-text-primary text-sm"
                        placeholder="Content URL"
                      />
                      <div className="flex gap-1">
                        <input
                          type="url"
                          value={content.thumbnail || ''}
                          onChange={(e) => handleNestedChange(['subjects', selectedSubjectIndex, 'sections', selectedSectionIndex, 'contents', cIdx, 'thumbnail'], e.target.value)}
                          className="flex-1 p-2 border border-secondary rounded bg-surface text-text-primary text-sm"
                          placeholder="Thumbnail URL"
                        />
                        <button
                          onClick={() => openThumbnailSelector('content', content.thumbnail || '', ['subjects', selectedSubjectIndex, 'sections', selectedSectionIndex, 'contents', cIdx, 'thumbnail'])}
                          className="bg-secondary text-text-primary px-2 py-2 rounded hover:bg-secondary/80 flex items-center"
                        >
                          <Image className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            const subjectThumbnail = batchData.subjects[selectedSubjectIndex]?.thumbnail;
                            if (subjectThumbnail) {
                              handleNestedChange(['subjects', selectedSubjectIndex, 'sections', selectedSectionIndex, 'contents', cIdx, 'thumbnail'], subjectThumbnail);
                              toast.success('Content thumbnail updated to match subject!');
                            }
                          }}
                          className="bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600 flex items-center"
                          title="Use subject thumbnail"
                        >
                          <Image className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => deleteContent(selectedSubjectIndex, selectedSectionIndex, cIdx)}
                        className="w-full bg-danger text-white py-2 rounded hover:bg-danger/80 text-sm flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchEditor;