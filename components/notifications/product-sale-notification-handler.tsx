"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { useRealTimeEvent } from "@/hooks/use-real-time-updates"
import { RealTimeEventType } from "@/lib/real-time-service"
import { CurrencyDisplay } from "@/components/ui/currency-display"

/**
 * Product Sale Notification Handler
 * 
 * Handles real-time notifications for product sales (POS and online orders)
 * Only sends notifications to:
 * - Admin and Super Admin (all sales)
 * - Managers (all sales)
 * - Online Store Receptionist (product sales only)
 */
export function ProductSaleNotificationHandler() {
  const { user } = useAuth()
  const { toast } = useToast()

  // Subscribe to transaction created events (product sales)
  useRealTimeEvent(
    RealTimeEventType.TRANSACTION_CREATED,
    (payload, event) => {
      if (!user) return

      const { transaction, source, amount, clientName } = payload

      // Only handle product sales (not service sales)
      const isProductSale = transaction?.type === 'PRODUCT_SALE' || 
                           transaction?.type === 'INVENTORY_SALE' ||
                           source === 'POS' ||
                           source === 'CLIENT_PORTAL'

      if (!isProductSale) {
        return
      }

      // Determine if user should receive this notification
      const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      const isManager = user.role === "MANAGER"
      const jobRole = (user as any).jobRole
      const isOnlineStoreReceptionist = jobRole === "online_store_receptionist"

      // Admin, Super Admin, Managers, and Online Store Receptionist get product sale notifications
      if (!isAdmin && !isManager && !isOnlineStoreReceptionist) {
        return
      }

      console.log("🛒 Product sale notification received:", payload)

      // Determine the source label
      let sourceLabel = "Sale"
      if (source === "CLIENT_PORTAL") {
        sourceLabel = "Online Order"
      } else if (source === "POS") {
        sourceLabel = "POS Sale"
      }

      // Show toast notification
      toast({
        title: `🛒 New ${sourceLabel}!`,
        description: (
          <div className="space-y-2">
            <p>
              <strong>{clientName || "Customer"}</strong> purchased products
            </p>
            {transaction?.items && transaction.items.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {transaction.items.map((item: any, index: number) => (
                  <div key={index}>
                    {item.quantity}x {item.name}
                  </div>
                ))}
              </div>
            )}
            {amount && (
              <div className="font-semibold">
                <CurrencyDisplay amount={amount} />
              </div>
            )}
            {transaction?.location && (
              <p className="text-xs text-muted-foreground">
                Location: {transaction.location}
              </p>
            )}
          </div>
        ),
        duration: 8000,
      })

      // Play notification sound if enabled
      try {
        if (typeof window !== 'undefined' && typeof (window as any).playNotificationSound === 'function') {
          const isAudioEnabled = localStorage.getItem('notificationAudioEnabled') === 'true'
          if (isAudioEnabled) {
            (window as any).playNotificationSound()
          }
        }
      } catch (error) {
        console.log("Notification sound failed:", error)
      }
    },
    [user, toast]
  )

  // This component doesn't render anything visible
  return null
}

