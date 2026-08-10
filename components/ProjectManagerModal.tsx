'use client';

import React, { useState, useEffect } from 'react';
import { SavedProject, LocationData, SystemConfig, SolarGenerationResult, FinancialResult } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { FolderOpen, X, Plus, Trash2, Download, Upload, MapPin, Calendar, Check } from 'lucide-react';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationData;
  currentSystemConfig: SystemConfig;
  currentSolarResult?: SolarGenerationResult;
  currentFinancials?: FinancialResult;
  onLoadProject: (project: SavedProject) => void;
}

export function ProjectManagerModal({
  isOpen,
  onClose,
  currentLocation,
  currentSystemConfig,
  currentSolarResult,
  currentFinancials,
  onLoadProject
}: ProjectManagerModalProps) {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    let mounted = true;
    if (isOpen && typeof window !== 'undefined') {
      const saved = localStorage.getItem('solarvision_projects');
      if (saved && mounted) {
        try {
          const parsed = JSON.parse(saved);
          setTimeout(() => {
            if (mounted) setProjects(parsed);
          }, 0);
        } catch (e) {
          console.warn("Failed parsing saved projects:", e);
        }
      }
    }
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const saveProjectsToStorage = (updated: SavedProject[]) => {
    setProjects(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('solarvision_projects', JSON.stringify(updated));
    }
  };

  const handleSaveCurrentSite = () => {
    const name = newProjectName.trim() || `${currentLocation.city || 'Site'} ${currentSystemConfig.capacityKw}kWp Project`;
    const newProject: SavedProject = {
      id: `proj_${Date.now()}`,
      name,
      description: newProjectDesc || `Solar assessment for ${currentLocation.address}`,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
      location: currentLocation,
      systemConfig: currentSystemConfig,
      solarResult: currentSolarResult,
      financialResult: currentFinancials
    };

    const updated = [newProject, ...projects];
    saveProjectsToStorage(updated);
    setNewProjectName('');
    setNewProjectDesc('');
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjectsToStorage(updated);
  };

  const handleExportJson = (project: SavedProject) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_solarvision.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div data-gsap="fade-up" className="w-full max-w-2xl glass-card rounded-2xl border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Project Management</h3>
              <p className="text-xs text-slate-400">Save, load, and export solar installation proposals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Active Site Section */}
        <div className="py-4 border-b border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">Save Current Active Site</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              placeholder="Project Name (e.g., Roof Solar - Bengaluru)"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description / Client Notes"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSaveCurrentSite}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Save Current Site to Projects
          </button>
        </div>

        {/* Saved Projects List */}
        <div className="flex-1 py-4 overflow-y-auto space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Saved Projects ({projects.length})</h4>

          {projects.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No saved projects yet. Save your current site above!
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{proj.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{proj.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-mono">
                    <span>{proj.systemConfig.capacityKw} kWp</span>
                    <span>•</span>
                    <span>{proj.location.city}, {proj.location.country}</span>
                    <span>•</span>
                    <span>{proj.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onLoadProject(proj);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Load
                  </button>
                  <button
                    onClick={() => handleExportJson(proj)}
                    className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
                    title="Export JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
