'use client';

interface MetadataCardProps {
  readonly createdAt: string | Date;
  readonly updatedAt: string | Date;
}

export function MetadataCard({ createdAt, updatedAt }: MetadataCardProps) {
  const createdDate = new Date(createdAt).toLocaleString();
  const updatedDate = new Date(updatedAt).toLocaleString();

  return (
    <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
      <h2 className="font-bold mb-4 text-[#1e4b8e] text-xl">Metadata</h2>
      <div className="gap-4 grid grid-cols-2 text-sm">
        <div>
          <span className="text-slate-600">Created:</span>{' '}
          <span className="font-medium text-slate-800">{createdDate}</span>
        </div>
        <div>
          <span className="text-slate-600">Last Updated:</span>{' '}
          <span className="font-medium text-slate-800">{updatedDate}</span>
        </div>
      </div>
    </div>
  );
}
