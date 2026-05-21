'use client';

import MacIcon from './MacIcon';

export function MacFolderIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <img
      src="/macos-folder.png"
      alt="Folder"
      className={`${className} object-contain macos-file-icon`}
      draggable={false}
    />
  );
}

export function MacDocumentIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <div className={`${className} relative macos-file-icon`}>
      <div className="absolute inset-x-[18%] inset-y-[6%] rounded-[6px] bg-white border border-black/10 shadow-sm" />
      <div className="absolute right-[18%] top-[6%] h-[26%] w-[26%] rounded-bl-[5px] bg-gradient-to-br from-slate-100 to-slate-300 border-l border-b border-black/10" />
      <div className="absolute left-[28%] right-[28%] top-[36%] h-[3px] rounded-full bg-slate-300" />
      <div className="absolute left-[28%] right-[22%] top-[48%] h-[3px] rounded-full bg-slate-300" />
      <div className="absolute left-[28%] right-[34%] top-[60%] h-[3px] rounded-full bg-slate-300" />
    </div>
  );
}

export function MacImageFileIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return <MacIcon id="gallery" className={className} />;
}
