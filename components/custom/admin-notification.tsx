"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Edit, X, Zap } from "lucide-react"
import { useEffect, useState } from "react"

export const AdminNotification = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 1000)
        const removeTimer = setTimeout(() => setIsVisible(false), 10000)

        return () => clearTimeout(removeTimer)

    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="fixed top-24 right-6 z-50"
                >
                    {/* Background blur effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent rounded-xl blur-xl opacity-60" />

                    {/* Main notification card */}
                    <div className="relative backdrop-blur-md bg-background/80 border border-primary/30 rounded-xl px-5 py-4 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-300 max-w-xs">
                        {/* Animated gradient border effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                        {/* Content */}
                        <div className="relative flex items-start gap-3">
                            {/* Icon */}
                            <motion.div
                                animate={{ rotate: [0, 10, 0, -10, 0] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                                className="flex-shrink-0"
                            >
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Edit className="h-5 w-5 text-primary" />
                                </div>
                            </motion.div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-primary mb-0.5">Powered by Admin Panel</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    This entire portfolio can be edited from the admin dashboard. No redeploy needed.
                                </p>
                            </div>

                            {/* Dot indicator */}
                            <motion.div
                                onClick={() => setIsVisible(false)}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                className="flex-shrink-0 ">
                                <X className="h-5 w-5 text-primary" />
                            </motion.div>


                        </div>

                        {/* Subtle shimmer effect */}
                        <motion.div
                            animate={{ x: ["100%", "-100%"] }}
                            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-50"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
