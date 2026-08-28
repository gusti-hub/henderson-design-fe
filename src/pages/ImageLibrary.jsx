import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Trash2, Copy, Check, Loader2, ImageIcon,
  Search, X, ChevronLeft, ChevronRight, CheckSquare, Square,
} from 'lucide-react';
import { backendServer } from '../utils/info';

const PAGE_SIZE = 20;

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ImageLibrary = () => {
  const [images, setImages]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [copiedKey, setCopiedKey]       = useState(null);
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [selected, setSelected]         = useState(new Set());
  const [deletingKeys, setDeletingKeys] = useState(new Set());
  const [deleteProgress, setDeleteProgress] = useState('');
  const [confirmModal, setConfirmModal] = useState(null); // null | 'selected' | 'all'
  const fileInputRef = useRef(null);

  const token = () => localStorage.getItem('token');

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendServer}/api/image-library`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setImages(data.images || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchImages(); }, []);

  // Reset page when search changes
  useEffect(() => { setPage(1); setSelected(new Set()); }, [search]);

  const handleUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of files) {
      setUploadProgress(`Uploading ${uploaded + 1}/${files.length}: ${file.name}`);
      try {
        const presignRes = await fetch(`${backendServer}/api/image-library/presigned-url`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        const { uploadUrl } = await presignRes.json();
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
          body: file,
        });
        uploaded++;
      } catch { /* continue */ }
    }
    setUploading(false);
    setUploadProgress('');
    fetchImages();
  };

  const deleteKeys = async (keys) => {
    setDeletingKeys(new Set(keys));
    setConfirmModal(null);

    const BATCH = 10;
    let done = 0;
    for (let i = 0; i < keys.length; i += BATCH) {
      const batch = keys.slice(i, i + BATCH);
      setDeleteProgress(`Deleting ${Math.min(done + BATCH, keys.length)} / ${keys.length}…`);
      await Promise.allSettled(batch.map(key =>
        fetch(`${backendServer}/api/image-library/${encodeURIComponent(key)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token()}` },
        })
      ));
      done += batch.length;
    }

    setDeleteProgress('Verifying…');
    await fetchImages();
    setSelected(new Set());
    setDeletingKeys(new Set());
    setDeleteProgress('');
  };

  const handleConfirmDelete = () => {
    if (confirmModal === 'selected') deleteKeys(Array.from(selected));
    if (confirmModal === 'all')      deleteKeys(filtered.map(img => img.key));
  };

  const copyUrl = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleSelect = (key) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const filtered = images.filter(img =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allPageSelected = paginated.length > 0 && paginated.every(img => selected.has(img.key));

  const toggleSelectPage = () => {
    setSelected(prev => {
      const n = new Set(prev);
      if (allPageSelected) { paginated.forEach(img => n.delete(img.key)); }
      else                 { paginated.forEach(img => n.add(img.key)); }
      return n;
    });
  };

  const confirmLabel = confirmModal === 'all'
    ? `Delete all ${filtered.length} images?`
    : `Delete ${selected.size} selected image${selected.size !== 1 ? 's' : ''}?`;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Image Library</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {images.length} image{images.length !== 1 ? 's' : ''} · DigitalOcean Spaces / image-library
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => setConfirmModal('selected')}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" /> Delete selected ({selected.size})
            </button>
          )}
          <button
            onClick={() => setConfirmModal('all')}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" /> Delete all
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => handleUpload(Array.from(e.target.files || []))}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-50"
            style={{ backgroundColor: '#005670' }}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? (uploadProgress || 'Uploading…') : 'Upload'}
          </button>
        </div>
      </div>

      {/* Search + select-all row */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSelectPage}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#005670] shrink-0"
          title={allPageSelected ? 'Deselect page' : 'Select page'}
        >
          {allPageSelected
            ? <CheckSquare className="w-4 h-4 text-[#005670]" />
            : <Square className="w-4 h-4" />}
          <span className="hidden sm:inline">Select page</span>
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by filename…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005670]/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-sm text-gray-400 hover:border-[#005670]/40 hover:text-[#005670] transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(Array.from(e.dataTransfer.files)); }}
      >
        <Upload className="w-5 h-5 mx-auto mb-1 opacity-50" />
        Drop images here or click Upload
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
          <ImageIcon className="w-10 h-10 opacity-30" />
          <p className="text-sm">{search ? 'No results' : 'No images yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginated.map(img => {
            const isSelected = selected.has(img.key);
            const isDeleting = deletingKeys.has(img.key);
            return (
              <div
                key={img.key}
                className={`group relative bg-white border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  isSelected ? 'border-[#005670]' : 'border-gray-200'
                }`}
                onClick={() => toggleSelect(img.key)}
              >
                {/* Checkbox */}
                <div className={`absolute top-2 left-2 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${isSelected ? 'bg-[#005670]' : 'bg-white/80 border border-gray-300'}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {/* Image */}
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {isDeleting ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                  ) : (
                    <>
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                      />
                      <div className="hidden w-full h-full items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="p-2 space-y-0.5">
                  <p className="text-xs font-medium text-gray-700 truncate" title={img.name}>{img.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(img.size)}</p>
                </div>

                {/* Action buttons (stop propagation so clicking them doesn't toggle selection) */}
                <div
                  className="absolute bottom-8 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => copyUrl(img.url, img.key)}
                    title="Copy URL"
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow border border-gray-200 hover:bg-gray-50"
                  >
                    {copiedKey === img.key
                      ? <Check className="w-3.5 h-3.5 text-green-600" />
                      : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} · {filtered.length} images
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page ? 'bg-[#005670] text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                )
              )
            }
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete progress overlay */}
      {deleteProgress && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center gap-3 min-w-[220px]">
            <Loader2 className="w-7 h-7 animate-spin text-[#005670]" />
            <p className="text-sm font-medium text-gray-700">{deleteProgress}</p>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">{confirmLabel}</h3>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageLibrary;
