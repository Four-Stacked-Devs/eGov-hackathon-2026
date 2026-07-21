interface LockedFieldProps {
  label: string;
  value: string;
}

/**
 * Read-only profile field. Once-Only Policy: identity data returned by
 * eVerify/eGovPH is never re-typed and never editable.
 */
export function LockedField({ label, value }: LockedFieldProps) {
  return (
    <div title="Managed by eGovPH">
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <div className="relative">
        <input
          readOnly
          tabIndex={-1}
          value={value}
          className="w-full cursor-default rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 pr-9 text-sm text-slate-700 focus:outline-none"
        />
        <svg
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-locked"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-label="Managed by eGovPH"
        >
          <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
