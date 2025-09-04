"use client"

import { Card, CardContent } from "@/components/ui/card"

export function MenuItemSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Image skeleton */}
        <div className="w-full h-32 sm:h-40 mb-4 rounded-xl skeleton"></div>
        
        {/* Category badge skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 w-20 rounded-full skeleton"></div>
          <div className="h-6 w-16 rounded-full skeleton"></div>
        </div>
        
        {/* Title skeleton */}
        <div className="h-6 w-3/4 mb-2 skeleton"></div>
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 w-full skeleton"></div>
          <div className="h-4 w-2/3 skeleton"></div>
        </div>
        
        {/* Price and time skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-16 skeleton"></div>
          <div className="h-6 w-20 rounded-full skeleton"></div>
        </div>
        
        {/* Button skeleton */}
        <div className="h-12 w-full rounded-full skeleton"></div>
      </CardContent>
    </Card>
  )
}

export function CategoryTabSkeleton() {
  return (
    <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 w-24 rounded-2xl skeleton flex-shrink-0"></div>
      ))}
    </div>
  )
}

export function CartSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-orange-200 p-4 shadow-2xl z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded skeleton"></div>
            <div>
              <div className="h-5 w-20 mb-1 skeleton"></div>
              <div className="h-4 w-16 skeleton"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-6 w-16 mb-1 skeleton"></div>
            <div className="h-3 w-20 skeleton"></div>
          </div>
        </div>
        <div className="h-12 w-full rounded-2xl skeleton"></div>
      </div>
    </div>
  )
}