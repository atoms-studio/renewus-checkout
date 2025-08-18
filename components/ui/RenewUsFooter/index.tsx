// Next.js React Component
// This component is designed for use in a Next.js project

import Image from "next/image"
import React from "react"

interface RenewUsFooterProps {
  copyright: string

  padding?: boolean
}

export default function RenewUsFooter({
  copyright,
}: RenewUsFooterProps) {
  return (
    <footer className="bg-brand-dark pb-[83px] md:pb-0">
      <p className="text-note font-normal text-white w-full text-center p-2">
        {copyright}
      </p>
    </footer>
  )
}
