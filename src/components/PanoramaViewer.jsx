// src/components/PanoramaViewer.jsx
// 360-degree panorama viewer component

import React from 'react';
import { X } from 'lucide-react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

export function PanoramaViewer({ isOpen, panoramaUrl, selectedLot, onClose }) {
    if (!isOpen || !panoramaUrl) return null;

    return (
        <div className="fixed inset-0 z-[3000] bg-black animate-in fade-in duration-500">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-[3010] bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-md transition-all"
            >
                <X size={24} />
            </button>

            <div className="w-full h-full">
                <ReactPhotoSphereViewer
                    key={panoramaUrl}
                    src={panoramaUrl}
                    height={'100vh'}
                    width={"100%"}
                    navbar={['zoom', 'fullscreen']}
                    defaultZoomLvl={50}
                />
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3010] bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/20">
                <p className="font-serif-display text-lg tracking-wider">
                    Vista Panorámica • {selectedLot?.properties?.lote}
                </p>
            </div>
        </div>
    );
}
