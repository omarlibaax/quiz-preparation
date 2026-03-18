export default function SubjectIcon({ subjectName }: { subjectName: string }) {
  const name = subjectName.toLowerCase()

  if (name.includes('mathematics')) {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true" fill="none">
        <path
          d="M7 7h10M7 12h10M7 17h10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    )
  }

  if (name.includes('physics')) {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true" fill="none">
        <path
          d="M12 12c2.7-2.7 6.7-2.7 9.4 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 12c-2.7 2.7-6.7 2.7-9.4 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M3 21l3-9M21 21l-3-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (name.includes('chemistry')) {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 2c2.5 0 6 3 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M22 12c0 3-4 6-7 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 22c-3 0-7-3-7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M2 12c0-3 4-7 7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Biology (DNA)
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true" fill="none">
      <path
        d="M7 4c0 8 10 8 10 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17 4c0 8-10 8-10 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M9 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

