"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { usePortfolio } from "../../context/PortfolioContext"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Loader2,
    Save,
    Plus,
    Trash2,
    User,
    Briefcase,
    FolderOpen,
    Mail,
    Palette,
    GripVertical,
    ArrowUp,
    GraduationCap,
    Eye,
    EyeOff,
} from "lucide-react"
import { updatePortfolioData } from "../../lib/portfolio-api"
import type { PortfolioData } from "../../context/PortfolioContext"
import { toast } from "sonner"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { formatHex, converter } from "culori"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"

// Color conversion utilities using culori
const hexToOklch = (hex: string): string => {
    try {
        const toOklch = converter('oklch');
        const oklchColor = toOklch(hex);

        if (!oklchColor) return 'oklch(0% 0 0)';

        const l = Math.round(oklchColor.l * 100);
        const c = Math.round(oklchColor.c * 1000) / 1000;
        const h = Math.round(oklchColor.h || 0);

        return `oklch(${l}% ${c} ${h})`;
    } catch (error) {
        console.error('Error converting hex to oklch:', error);
        return 'oklch(0% 0 0)';
    }
};

const oklchToHex = (oklchString: string): string => {
    try {
        // Parse the oklch string
        const match = oklchString.match(/oklch\(([^%]+)%?\s+([^\s]+)\s+([^)]+)\)/);
        if (!match) return '#000000';

        const l = parseFloat(match[1]) / 100;
        const c = parseFloat(match[2]);
        const h = parseFloat(match[3]);

        const oklchColor = {
            mode: 'oklch' as const,
            l: l,
            c: c,
            h: h
        };

        // Create oklch color object and convert to hex
        const hexColor = formatHex(oklchColor);
        return hexColor || '#000000';
    } catch (error) {
        console.error('Error converting oklch to hex:', error);
        return '#000000';
    }
};


interface SectionOrder {
    hero: number
    about: number
    projects: number
    experience: number
    skills: number
    education: number
    contacts: number
}

interface SortableItemProps {
    id: string
    section: string
    order: number
    isHidden: boolean
    onToggleVisibility: (section: string) => void
}

const SortableItem: React.FC<SortableItemProps> = ({ id, section, order, isHidden, onToggleVisibility }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex items-center justify-between p-3 border border-border rounded-lg bg-card ${isHidden ? "opacity-50" : ""}`}
        >
            <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize font-medium">{section}</span>
                {isHidden && (
                    <Badge variant="secondary" className="text-xs">
                        Hidden
                    </Badge>
                )}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{isHidden ? "Hidden" : `Position ${order}`}</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggleVisibility(section)
                    }}
                    className="h-8 w-8 p-0"
                >
                    {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    const { isAuthenticated, data: portfolioData, refreshData } = usePortfolio()
    const router = useRouter()
    const [editedData, setEditedData] = useState<PortfolioData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [sectionOrder, setSectionOrder] = useState<SectionOrder>({
        hero: 1,
        about: 2,
        projects: 3,
        experience: 4,
        skills: 5,
        education: 6,
        contacts: 7,
    })
    const [selectedThemeMode, setSelectedThemeMode] = useState<"light" | "dark">("dark")

        useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    useEffect(() => {
        if (portfolioData) {
            const data = JSON.parse(JSON.stringify(portfolioData))
            setSectionOrder(data.sectionOrder)
            setEditedData(data)
            setSelectedThemeMode(data.theme?.currentMode || "dark")
        }
    }, [portfolioData])

    const handleSave = async () => {
        if (!editedData || !portfolioData) return
        setIsLoading(true)
        try {
            await updatePortfolioData(portfolioData, { ...editedData, sectionOrder })
            await refreshData()
            setIsDirty(false)
            toast.success("Portfolio updated successfully!")
        } catch (error) {
            console.error("Error updating portfolio:", error)
            toast.error("Failed to update portfolio")
        } finally {
            setIsLoading(false)
        }
    }

    const updateField = (path: string[], value: unknown) => {
        if (!editedData) return
        const newData = JSON.parse(JSON.stringify(editedData))
        let current = newData
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {}
            }
            current = current[path[i]]
        }
        current[path[path.length - 1]] = value
        setEditedData(newData)
        setIsDirty(true)
    }

    const updateColorField = (path: string[], hexColor: string) => {
        const oklchColor = hexToOklch(hexColor)
        updateField(path, oklchColor)
    }

    // Section visibility toggle
    const toggleSectionVisibility = (section: string) => {
        const currentOrder = sectionOrder[section as keyof SectionOrder]
        const newOrder = currentOrder === 0 ? getNextAvailableOrder() : 0

        setSectionOrder((prev) => ({
            ...prev,
            [section]: newOrder,
        }))
        setIsDirty(true)
    }

    const getNextAvailableOrder = () => {
        const visibleOrders = Object.values(sectionOrder).filter((order) => order > 0)
        return Math.max(...visibleOrders, 0) + 1
    }

    // Hero section functions
    const addHeroHighlight = () => {
        if (!editedData) return
        const currentHighlights = editedData.hero.highlights || []
        updateField(["hero", "highlights"], [...currentHighlights, "New highlight"])
    }

    const removeHeroHighlight = (index: number) => {
        if (!editedData) return
        const currentHighlights = editedData.hero.highlights || []
        updateField(
            ["hero", "highlights"],
            currentHighlights.filter((_, i) => i !== index),
        )
    }

    const addSocialLink = () => {
        if (!editedData) return
        const currentLinks = editedData.hero.socialLinks || []
        updateField(["hero", "socialLinks"], [...currentLinks, { name: "New Platform", url: "", icon: "link" }])
    }

    const removeSocialLink = (index: number) => {
        if (!editedData) return
        const currentLinks = editedData.hero.socialLinks || []
        updateField(
            ["hero", "socialLinks"],
            currentLinks.filter((_, i) => i !== index),
        )
    }

    const addStat = () => {
        if (!editedData) return
        const currentStats = editedData.hero.stats || []
        updateField(["hero", "stats"], [...currentStats, { number: "0", label: "New Stat" }])
    }

    const removeStat = (index: number) => {
        if (!editedData) return
        const currentStats = editedData.hero.stats || []
        updateField(
            ["hero", "stats"],
            currentStats.filter((_, i) => i !== index),
        )
    }

    const addHeroSkill = (skill: string) => {
        if (!editedData || !skill.trim()) return
        const currentSkills = editedData.hero.skills || []
        if (!currentSkills.includes(skill.trim())) {
            updateField(["hero", "skills"], [...currentSkills, skill.trim()])
        }
    }

    const removeHeroSkill = (skill: string) => {
        if (!editedData) return
        const currentSkills = editedData.hero.skills || []
        updateField(
            ["hero", "skills"],
            currentSkills.filter((s) => s !== skill),
        )
    }

    // About section functions
    const addLanguage = (language: string) => {
        if (!editedData || !language.trim()) return
        const currentLanguages = editedData.about.personalInfo?.languages || []
        if (!currentLanguages.includes(language.trim())) {
            updateField(["about", "personalInfo", "languages"], [...currentLanguages, language.trim()])
        }
    }

    const removeLanguage = (language: string) => {
        if (!editedData) return
        const currentLanguages = editedData.about.personalInfo?.languages || []
        updateField(
            ["about", "personalInfo", "languages"],
            currentLanguages.filter((l) => l !== language),
        )
    }

    const addHobby = (hobby: string) => {
        if (!editedData || !hobby.trim()) return
        const currentHobbies = editedData.about.personalInfo?.hobbies || []
        if (!currentHobbies.includes(hobby.trim())) {
            updateField(["about", "personalInfo", "hobbies"], [...currentHobbies, hobby.trim()])
        }
    }

    const removeHobby = (hobby: string) => {
        if (!editedData) return
        const currentHobbies = editedData.about.personalInfo?.hobbies || []
        updateField(
            ["about", "personalInfo", "hobbies"],
            currentHobbies.filter((h) => h !== hobby),
        )
    }

    const addAchievement = () => {
        if (!editedData) return
        const currentAchievements = editedData.about.achievements || []
        updateField(
            ["about", "achievements"],
            [
                ...currentAchievements,
                {
                    title: "New Achievement",
                    description: "Description of achievement",
                    year: new Date().getFullYear().toString(),
                },
            ],
        )
    }

    const removeAchievement = (index: number) => {
        if (!editedData) return
        const currentAchievements = editedData.about.achievements || []
        updateField(
            ["about", "achievements"],
            currentAchievements.filter((_, i) => i !== index),
        )
    }

    const addCertification = () => {
        if (!editedData) return
        const currentCertifications = editedData.about.certifications || []
        updateField(
            ["about", "certifications"],
            [
                ...currentCertifications,
                {
                    name: "New Certification",
                    issuer: "Issuer",
                    year: new Date().getFullYear().toString(),
                },
            ],
        )
    }

    const removeCertification = (index: number) => {
        if (!editedData) return
        const currentCertifications = editedData.about.certifications || []
        updateField(
            ["about", "certifications"],
            currentCertifications.filter((_, i) => i !== index),
        )
    }

    // Project functions
    const addProject = () => {
        if (!editedData) return
        const newProject = {
            id: Date.now().toString(),
            title: "New Project",
            description: "Project description",
            tech: [],
            link: "",
            github: "",
            image: "/placeholder.svg?height=300&width=400",
            category: "Web Development",
            status: "completed" as const,
            year: new Date().getFullYear().toString(),
            role: "Developer",
            features: [],
        }
        updateField(["projects"], [...editedData.projects, newProject])
    }

    const removeProject = (id: string) => {
        if (!editedData) return
        updateField(
            ["projects"],
            editedData.projects.filter((p) => p.id !== id),
        )
    }

    const addProjectFeature = (projectIndex: number, feature: string) => {
        if (!editedData || !feature.trim()) return
        const newProjects = [...editedData.projects]
        const currentFeatures = newProjects[projectIndex].features || []
        if (!currentFeatures.includes(feature.trim())) {
            newProjects[projectIndex].features = [...currentFeatures, feature.trim()]
            updateField(["projects"], newProjects)
        }
    }

    const removeProjectFeature = (projectIndex: number, feature: string) => {
        if (!editedData) return
        const newProjects = [...editedData.projects]
        const currentFeatures = newProjects[projectIndex].features || []
        newProjects[projectIndex].features = currentFeatures.filter((f) => f !== feature)
        updateField(["projects"], newProjects)
    }

    // Experience functions
    const addExperience = () => {
        if (!editedData) return
        const newExperience = {
            id: Date.now().toString(),
            company: "New Company",
            role: "New Role",
            year: "2024 - Present",
            description: "Description of role",
            type: "full-time" as const,
            current: false,
            achievements: [],
            technologies: [],
            responsibilities: [],
        }
        updateField(["experience"], [...editedData.experience, newExperience])
    }

    const removeExperience = (id: string) => {
        if (!editedData) return
        updateField(
            ["experience"],
            editedData.experience.filter((e) => e.id !== id),
        )
    }

    const addExperienceAchievement = (expIndex: number, achievement: string) => {
        if (!editedData || !achievement.trim()) return
        const newExperience = [...editedData.experience]
        const currentAchievements = newExperience[expIndex].achievements || []
        if (!currentAchievements.includes(achievement.trim())) {
            newExperience[expIndex].achievements = [...currentAchievements, achievement.trim()]
            updateField(["experience"], newExperience)
        }
    }

    const removeExperienceAchievement = (expIndex: number, achievement: string) => {
        if (!editedData) return
        const newExperience = [...editedData.experience]
        const currentAchievements = newExperience[expIndex].achievements || []
        newExperience[expIndex].achievements = currentAchievements.filter((a) => a !== achievement)
        updateField(["experience"], newExperience)
    }

    const addExperienceTechnology = (expIndex: number, tech: string) => {
        if (!editedData || !tech.trim()) return
        const newExperience = [...editedData.experience]
        const currentTech = newExperience[expIndex].technologies || []
        if (!currentTech.includes(tech.trim())) {
            newExperience[expIndex].technologies = [...currentTech, tech.trim()]
            updateField(["experience"], newExperience)
        }
    }

    const removeExperienceTechnology = (expIndex: number, tech: string) => {
        if (!editedData) return
        const newExperience = [...editedData.experience]
        const currentTech = newExperience[expIndex].technologies || []
        newExperience[expIndex].technologies = currentTech.filter((t) => t !== tech)
        updateField(["experience"], newExperience)
    }

    const addExperienceResponsibility = (expIndex: number, responsibility: string) => {
        if (!editedData || !responsibility.trim()) return
        const newExperience = [...editedData.experience]
        const currentResponsibilities = newExperience[expIndex].responsibilities || []
        if (!currentResponsibilities.includes(responsibility.trim())) {
            newExperience[expIndex].responsibilities = [...currentResponsibilities, responsibility.trim()]
            updateField(["experience"], newExperience)
        }
    }

    const removeExperienceResponsibility = (expIndex: number, responsibility: string) => {
        if (!editedData) return
        const newExperience = [...editedData.experience]
        const currentResponsibilities = newExperience[expIndex].responsibilities || []
        newExperience[expIndex].responsibilities = currentResponsibilities.filter((r) => r !== responsibility)
        updateField(["experience"], newExperience)
    }

    // Education functions
    const addEducation = () => {
        if (!editedData) return
        const newEducation = {
            id: Date.now().toString(),
            institution: "New Institution",
            degree: "New Degree",
            year: "2020 - 2024",
            description: "Description of education",
        }
        const currentEducation = editedData.education || []
        updateField(["education"], [...currentEducation, newEducation])
    }

    const removeEducation = (id: string) => {
        if (!editedData) return
        const currentEducation = editedData.education || []
        updateField(
            ["education"],
            currentEducation.filter((e) => e.id !== id),
        )
    }

    // Skills functions
    const addSkill = (category: 'frontend' | 'backend' | 'tools' | 'databases' | 'cloud' | 'mobile' | 'design' | 'testing' | 'devops' | 'languages' | 'frameworks', skill: string) => {
        if (!editedData || !skill.trim()) return

        if (category === "languages" || category === "frameworks") {
            // Handle special array types
            return
        }

        const currentSkills = editedData.skills[category] as string[]
        if (currentSkills && !currentSkills.includes(skill.trim())) {
            updateField(["skills", category], [...currentSkills, skill.trim()])
        }
    }

    const removeSkill = (category: 'frontend' | 'backend' | 'tools' | 'databases' | 'cloud' | 'mobile' | 'design' | 'testing' | 'devops' | 'languages' | 'frameworks', skill: string) => {
        if (!editedData) return

        if (category === "languages" || category === "frameworks") {
            return
        }

        const currentSkills = editedData.skills[category] as string[]
        if (currentSkills) {
            updateField(
                ["skills", category],
                currentSkills.filter((s) => s !== skill),
            )
        }
    }

    const addLanguageSkill = () => {
        if (!editedData) return
        const currentLanguages = editedData.skills.languages || []
        updateField(
            ["skills", "languages"],
            [
                ...currentLanguages,
                {
                    name: "New Language",
                    proficiency: "beginner" as const,
                    yearsOfExperience: 1,
                },
            ],
        )
    }

    const removeLanguageSkill = (index: number) => {
        if (!editedData) return
        const currentLanguages = editedData.skills.languages || []
        updateField(
            ["skills", "languages"],
            currentLanguages.filter((_, i) => i !== index),
        )
    }

    const addFrameworkSkill = () => {
        if (!editedData) return
        const currentFrameworks = editedData.skills.frameworks || []
        updateField(
            ["skills", "frameworks"],
            [
                ...currentFrameworks,
                {
                    name: "New Framework",
                    category: "Frontend",
                    proficiency: "beginner" as const,
                },
            ],
        )
    }

    const removeFrameworkSkill = (index: number) => {
        if (!editedData) return
        const currentFrameworks = editedData.skills.frameworks || []
        updateField(
            ["skills", "frameworks"],
            currentFrameworks.filter((_, i) => i !== index),
        )
    }

    // Drag and drop handler
    const handleDragEnd = (event: any) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const visibleSections = Object.entries(sectionOrder)
            .filter(([, order]) => order > 0)
            .sort(([, a], [, b]) => a - b)

        const oldIndex = visibleSections.findIndex(([section]) => section === active.id)
        const newIndex = visibleSections.findIndex(([section]) => section === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        const newVisibleSections = [...visibleSections]
        const [movedItem] = newVisibleSections.splice(oldIndex, 1)
        newVisibleSections.splice(newIndex, 0, movedItem)

        const newOrder = { ...sectionOrder }
        newVisibleSections.forEach(([section], index) => {
            newOrder[section as keyof SectionOrder] = index + 1
        })

        setSectionOrder(newOrder)
        setIsDirty(true)
    }

    // Theme parsing function
    // Define the interface for theme styles
    interface ThemeStyles {
        [key: string]: string; // Allows string indexing with string values (OKLCH colors)
        background: string;
        foreground: string;
        card: string;
        'card-foreground': string;
        popover: string;
        'popover-foreground': string;
        primary: string;
        'primary-foreground': string;
        secondary: string;
        'secondary-foreground': string;
        muted: string;
        'muted-foreground': string;
        accent: string;
        'accent-foreground': string;
        destructive: string;
        'destructive-foreground': string;
        border: string;
        input: string;
        ring: string;
    }

    // Define the interface for the styles object
    interface ThemeConfig {
        light: ThemeStyles;
        dark: ThemeStyles;
    }

    function parseThemeConfig(config: string): ThemeConfig {
        const styles: ThemeConfig = {
            light: {
                background: 'oklch(50% 0.1 180)',
                foreground: 'oklch(50% 0.1 180)',
                card: 'oklch(50% 0.1 180)',
                'card-foreground': 'oklch(50% 0.1 180)',
                popover: 'oklch(50% 0.1 180)',
                'popover-foreground': 'oklch(50% 0.1 180)',
                primary: 'oklch(50% 0.1 180)',
                'primary-foreground': 'oklch(50% 0.1 180)',
                secondary: 'oklch(50% 0.1 180)',
                'secondary-foreground': 'oklch(50% 0.1 180)',
                muted: 'oklch(50% 0.1 180)',
                'muted-foreground': 'oklch(50% 0.1 180)',
                accent: 'oklch(50% 0.1 180)',
                'accent-foreground': 'oklch(50% 0.1 180)',
                destructive: 'oklch(50% 0.1 180)',
                'destructive-foreground': 'oklch(50% 0.1 180)',
                border: 'oklch(50% 0.1 180)',
                input: 'oklch(50% 0.1 180)',
                ring: 'oklch(50% 0.1 180)',
            },
            dark: {
                background: 'oklch(50% 0.1 180)',
                foreground: 'oklch(50% 0.1 180)',
                card: 'oklch(50% 0.1 180)',
                'card-foreground': 'oklch(50% 0.1 180)',
                popover: 'oklch(50% 0.1 180)',
                'popover-foreground': 'oklch(50% 0.1 180)',
                primary: 'oklch(50% 0.1 180)',
                'primary-foreground': 'oklch(50% 0.1 180)',
                secondary: 'oklch(50% 0.1 180)',
                'secondary-foreground': 'oklch(50% 0.1 180)',
                muted: 'oklch(50% 0.1 180)',
                'muted-foreground': 'oklch(50% 0.1 180)',
                accent: 'oklch(50% 0.1 180)',
                'accent-foreground': 'oklch(50% 0.1 180)',
                destructive: 'oklch(50% 0.1 180)',
                'destructive-foreground': 'oklch(50% 0.1 180)',
                border: 'oklch(50% 0.1 180)',
                input: 'oklch(50% 0.1 180)',
                ring: 'oklch(50% 0.1 180)',
            },
        };

        const keys = [
            'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
            'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted',
            'muted-foreground', 'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
            'border', 'input', 'ring',
        ];

        // Extract :root and .dark sections
        const rootMatch = config.match(/:root\s*\{([^}]*)\}/);
        const darkMatch = config.match(/\.dark\s*\{([^}]*)\}/);

        if (rootMatch) {
            const rootVars = rootMatch[1].split(';').map(s => s.trim()).filter(s => s);
            rootVars.forEach(varDef => {
                const [key, value] = varDef.split(':').map(s => s.trim());
                const cleanKey = key.replace(/^--/, '');
                if (keys.includes(cleanKey)) {
                    // Convert OKLCH values from decimal to percentage format
                    const match = value.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
                    if (match) {
                        const [_, l, c, h] = match;
                        styles.light[cleanKey] = `oklch(${parseFloat(l) * 100}% ${c} ${h})`;
                    }
                }
            });
        }

        if (darkMatch) {
            const darkVars = darkMatch[1].split(';').map(s => s.trim()).filter(s => s);
            darkVars.forEach(varDef => {
                const [key, value] = varDef.split(':').map(s => s.trim());
                const cleanKey = key.replace(/^--/, '');
                if (keys.includes(cleanKey)) {
                    const match = value.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
                    if (match) {
                        const [_, l, c, h] = match;
                        styles.dark[cleanKey] = `oklch(${parseFloat(l) * 100}% ${c} ${h})`;
                    }
                }
            });
        }

        return styles;
    }

    if (!editedData) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const visibleSections = Object.entries(sectionOrder).filter(([, order]) => order > 0)
    const hiddenSections = Object.entries(sectionOrder).filter(([, order]) => order === 0)

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto p-4 max-w-7xl">
                <div className="flex flex-col lg:flex-row items-start justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage your portfolio content</p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={!isDirty || isLoading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full lg:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>

                <div className="w-full">
                    <Tabs defaultValue="ordering" className="space-y-4">
                        <div className="overflow-x-auto">
                            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 bg-muted lg:min-w-max">
                                <TabsTrigger value="ordering" className="flex flex-col sm:flex-row items-center gap-1">
                                    <GripVertical className="h-4 w-4" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">Ordering</span>
                                </TabsTrigger>
                                <TabsTrigger value="hero" className="flex flex-col sm:flex-row items-center gap-1 text-xs lg:text-sm">
                                    <User className="h-3 w-3 lg:h-4 lg:w-4" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">Hero</span>
                                </TabsTrigger>
                                <TabsTrigger value="about" className="flex flex-col sm:flex-row items-center gap-1 text-xs lg:text-sm">
                                    <User className="h-3 w-3 lg:h-4 lg:w-4" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">About</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="projects"
                                    className="flex flex-col sm:flex-row items-center gap-1 text-xs lg:text-sm"
                                >
                                    <FolderOpen className="h-3 w-3 lg:h-4 lg:w-4" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">Projects</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="experience"
                                    className="flex flex-col sm:flex-row items-center gap-1 text-xs lg:text-sm"
                                >
                                    <Briefcase className="h-3 w-3 lg:h-4 lg:w-4" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">Experience</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="skills"
                                    className="flex flex-col sm:flex-row items-center gap-1 text-xs lg:text-sm"
                                >
                                    <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">Skills</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="education"
                                    className="flex flex-col sm:flex-row items-center gap-1 text-xs lg:text-sm"
                                >
                                    <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">Education</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="contacts"
                                    className="flex flex-col sm:flex-row items-center gap-1 text-xs lg:text-sm"
                                >
                                    <Mail className="h-3 w-3 lg:h-4 lg:w-4" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">Contacts</span>
                                </TabsTrigger>
                                <TabsTrigger value="theme" className="flex flex-col sm:flex-row items-center gap-1 text-xs lg:text-sm">
                                    <Palette className="h-4 w-4" />
                                    <span className="text-xs sm:text-sm hidden sm:inline">Theme</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Section Ordering */}
                        <TabsContent value="ordering">
                            <Card className="bg-card text-card-foreground border-border">
                                <CardHeader>
                                    <CardTitle>Section Ordering & Visibility</CardTitle>
                                    <CardDescription>Drag and drop to reorder portfolio sections, or hide/show them</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Visible Sections */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Visible Sections</h3>
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext
                                                items={visibleSections.map(([section]) => section)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-2">
                                                    {visibleSections
                                                        .sort(([, a], [, b]) => a - b)
                                                        .map(([section, order]) => (
                                                            <SortableItem
                                                                key={section}
                                                                id={section}
                                                                section={section}
                                                                order={order}
                                                                isHidden={false}
                                                                onToggleVisibility={toggleSectionVisibility}
                                                            />
                                                        ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>

                                    {/* Hidden Sections */}
                                    {hiddenSections.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3">Hidden Sections</h3>
                                            <div className="space-y-2">
                                                {hiddenSections.map(([section, order]) => (
                                                    <SortableItem
                                                        key={section}
                                                        id={section}
                                                        section={section}
                                                        order={order}
                                                        isHidden={true}
                                                        onToggleVisibility={toggleSectionVisibility}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Hero Section */}
                        <TabsContent value="hero">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Hero Section</h3>
                                        <p className="text-sm text-muted-foreground">Main landing section content</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleSectionVisibility("hero")}
                                        className={sectionOrder.hero === 0 ? "text-green-600" : "text-red-600"}
                                    >
                                        {sectionOrder.hero === 0 ? (
                                            <>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Show Section
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="mr-2 h-4 w-4" />
                                                Hide Section
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-heading">Heading</Label>
                                                <Input
                                                    id="hero-heading"
                                                    value={editedData.hero.heading}
                                                    onChange={(e) => updateField(["hero", "heading"], e.target.value)}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-subheading">Subheading</Label>
                                                <Input
                                                    id="hero-subheading"
                                                    value={editedData.hero.subheading}
                                                    onChange={(e) => updateField(["hero", "subheading"], e.target.value)}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-cta">CTA Button Text</Label>
                                                <Input
                                                    id="hero-cta"
                                                    value={editedData.hero.cta}
                                                    onChange={(e) => updateField(["hero", "cta"], e.target.value)}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-image">Image URL</Label>
                                                <Input
                                                    id="hero-image"
                                                    value={editedData.hero.image}
                                                    onChange={(e) => updateField(["hero", "image"], e.target.value)}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-greeting">Greeting (Optional)</Label>
                                                <Input
                                                    id="hero-greeting"
                                                    value={editedData.hero.greeting || ""}
                                                    onChange={(e) => updateField(["hero", "greeting"], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="e.g., Welcome to my portfolio!"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-location">Location (Optional)</Label>
                                                <Input
                                                    id="hero-location"
                                                    value={editedData.hero.location || ""}
                                                    onChange={(e) => updateField(["hero", "location"], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="e.g., New York, USA"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-tagline">Tagline (Optional)</Label>
                                                <Input
                                                    id="hero-tagline"
                                                    value={editedData.hero.tagline || ""}
                                                    onChange={(e) => updateField(["hero", "tagline"], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="e.g., Building the future, one line of code at a time"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-cv">CV Download Link (Optional)</Label>
                                                <Input
                                                    id="hero-cv"
                                                    value={editedData.hero.downloadCV || ""}
                                                    onChange={(e) => updateField(["hero", "downloadCV"], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="e.g., /resume.pdf"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Hero Highlights */}
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Highlights</CardTitle>
                                            <Button onClick={addHeroHighlight} variant="outline" size="sm">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Highlight
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {(editedData.hero.highlights || []).map((highlight, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        value={highlight}
                                                        onChange={(e) => {
                                                            const newHighlights = [...(editedData.hero.highlights || [])]
                                                            newHighlights[index] = e.target.value
                                                            updateField(["hero", "highlights"], newHighlights)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                    <Button
                                                        onClick={() => removeHeroHighlight(index)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Social Links */}
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Social Links</CardTitle>
                                            <Button onClick={addSocialLink} variant="outline" size="sm">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Social Link
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {(editedData.hero.socialLinks || []).map((link, index) => (
                                                <div
                                                    key={index}
                                                    className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 border border-border rounded-lg"
                                                >
                                                    <div className="space-y-2">
                                                        <Label>Platform Name</Label>
                                                        <Input
                                                            value={link.name}
                                                            onChange={(e) => {
                                                                const newLinks = [...(editedData.hero.socialLinks || [])]
                                                                newLinks[index].name = e.target.value
                                                                updateField(["hero", "socialLinks"], newLinks)
                                                            }}
                                                            className="bg-background border-input"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>URL</Label>
                                                        <Input
                                                            value={link.url}
                                                            onChange={(e) => {
                                                                const newLinks = [...(editedData.hero.socialLinks || [])]
                                                                newLinks[index].url = e.target.value
                                                                updateField(["hero", "socialLinks"], newLinks)
                                                            }}
                                                            className="bg-background border-input"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Icon</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={link.icon}
                                                                onChange={(e) => {
                                                                    const newLinks = [...(editedData.hero.socialLinks || [])]
                                                                    newLinks[index].icon = e.target.value
                                                                    updateField(["hero", "socialLinks"], newLinks)
                                                                }}
                                                                className="bg-background border-input"
                                                                placeholder="e.g., github, linkedin"
                                                            />
                                                            <Button
                                                                onClick={() => removeSocialLink(index)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Stats */}
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Statistics</CardTitle>
                                            <Button onClick={addStat} variant="outline" size="sm">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Stat
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {(editedData.hero.stats || []).map((stat, index) => (
                                                <div
                                                    key={index}
                                                    className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 border border-border rounded-lg"
                                                >
                                                    <div className="space-y-2">
                                                        <Label>Number</Label>
                                                        <Input
                                                            value={stat.number}
                                                            onChange={(e) => {
                                                                const newStats = [...(editedData.hero.stats || [])]
                                                                newStats[index].number = e.target.value
                                                                updateField(["hero", "stats"], newStats)
                                                            }}
                                                            className="bg-background border-input"
                                                            placeholder="e.g., 5+"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Label</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={stat.label}
                                                                onChange={(e) => {
                                                                    const newStats = [...(editedData.hero.stats || [])]
                                                                    newStats[index].label = e.target.value
                                                                    updateField(["hero", "stats"], newStats)
                                                                }}
                                                                className="bg-background border-input"
                                                                placeholder="e.g., Years Experience"
                                                            />
                                                            <Button
                                                                onClick={() => removeStat(index)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Hero Skills */}
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <CardTitle>Featured Skills</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {(editedData.hero.skills || []).map((skill, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                        {skill}
                                                        <button onClick={() => removeHeroSkill(skill)} className="ml-1 hover:text-destructive">
                                                            ×
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            <Input
                                                placeholder="Add skill and press Enter"
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                        addHeroSkill(e.currentTarget.value)
                                                        e.currentTarget.value = ""
                                                    }
                                                }}
                                                className="bg-background border-input"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* About Section */}
                        <TabsContent value="about">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">About Section</h3>
                                        <p className="text-sm text-muted-foreground">About me content and personal information</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleSectionVisibility("about")}
                                        className={sectionOrder.about === 0 ? "text-green-600" : "text-red-600"}
                                    >
                                        {sectionOrder.about === 0 ? (
                                            <>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Show Section
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="mr-2 h-4 w-4" />
                                                Hide Section
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Main About Content */}
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <CardTitle>Main Content</CardTitle>
                                        <CardDescription>About me content (Markdown supported)</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Label htmlFor="about-markdown">Content</Label>
                                            <Textarea
                                                id="about-markdown"
                                                value={editedData.about.markdown}
                                                onChange={(e) => updateField(["about", "markdown"], e.target.value)}
                                                className="min-h-[200px] bg-background border-input"
                                                placeholder="Write your about content in markdown..."
                                            />
                                        </div>
                                        <div className="space-y-2 mt-4">
                                            <Label htmlFor="about-professional">Professional Summary (Optional)</Label>
                                            <Textarea
                                                id="about-professional"
                                                value={editedData.about.professionalSummary || ""}
                                                onChange={(e) => updateField(["about", "professionalSummary"], e.target.value)}
                                                className="min-h-[100px] bg-background border-input"
                                                placeholder="Brief professional summary..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Personal Information */}
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="personal-fullname">Full Name</Label>
                                                <Input
                                                    id="personal-fullname"
                                                    value={editedData.about.personalInfo?.fullName || ""}
                                                    onChange={(e) => updateField(["about", "personalInfo", "fullName"], e.target.value)}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="personal-age">Age (Optional)</Label>
                                                <Input
                                                    id="personal-age"
                                                    type="number"
                                                    value={editedData.about.personalInfo?.age || ""}
                                                    onChange={(e) =>
                                                        updateField(
                                                            ["about", "personalInfo", "age"],
                                                            e.target.value ? Number.parseInt(e.target.value) : undefined,
                                                        )
                                                    }
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="personal-nationality">Nationality (Optional)</Label>
                                            <Input
                                                id="personal-nationality"
                                                value={editedData.about.personalInfo?.nationality || ""}
                                                onChange={(e) => updateField(["about", "personalInfo", "nationality"], e.target.value)}
                                                className="bg-background border-input"
                                            />
                                        </div>

                                        {/* Languages */}
                                        <div className="space-y-3">
                                            <Label>Languages</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {(editedData.about.personalInfo?.languages || []).map((language, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                        {language}
                                                        <button onClick={() => removeLanguage(language)} className="ml-1 hover:text-destructive">
                                                            ×
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            <Input
                                                placeholder="Add language and press Enter"
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                        addLanguage(e.currentTarget.value)
                                                        e.currentTarget.value = ""
                                                    }
                                                }}
                                                className="bg-background border-input"
                                            />
                                        </div>

                                        {/* Hobbies */}
                                        <div className="space-y-3">
                                            <Label>Hobbies</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {(editedData.about.personalInfo?.hobbies || []).map((hobby, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                        {hobby}
                                                        <button onClick={() => removeHobby(hobby)} className="ml-1 hover:text-destructive">
                                                            ×
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            <Input
                                                placeholder="Add hobby and press Enter"
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                        addHobby(e.currentTarget.value)
                                                        e.currentTarget.value = ""
                                                    }
                                                }}
                                                className="bg-background border-input"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Achievements */}
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Achievements</CardTitle>
                                            <Button onClick={addAchievement} variant="outline" size="sm">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Achievement
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {(editedData.about.achievements || []).map((achievement, index) => (
                                                <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Achievement {index + 1}</h4>
                                                        <Button
                                                            onClick={() => removeAchievement(index)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Title</Label>
                                                            <Input
                                                                value={achievement.title}
                                                                onChange={(e) => {
                                                                    const newAchievements = [...(editedData.about.achievements || [])]
                                                                    newAchievements[index].title = e.target.value
                                                                    updateField(["about", "achievements"], newAchievements)
                                                                }}
                                                                className="bg-background border-input"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Year</Label>
                                                            <Input
                                                                value={achievement.year}
                                                                onChange={(e) => {
                                                                    const newAchievements = [...(editedData.about.achievements || [])]
                                                                    newAchievements[index].year = e.target.value
                                                                    updateField(["about", "achievements"], newAchievements)
                                                                }}
                                                                className="bg-background border-input"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Description</Label>
                                                        <Textarea
                                                            value={achievement.description}
                                                            onChange={(e) => {
                                                                const newAchievements = [...(editedData.about.achievements || [])]
                                                                newAchievements[index].description = e.target.value
                                                                updateField(["about", "achievements"], newAchievements)
                                                            }}
                                                            className="bg-background border-input"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Certifications */}
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Certifications</CardTitle>
                                            <Button onClick={addCertification} variant="outline" size="sm">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Certification
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {(editedData.about.certifications || []).map((cert, index) => (
                                                <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Certification {index + 1}</h4>
                                                        <Button
                                                            onClick={() => removeCertification(index)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Name</Label>
                                                            <Input
                                                                value={cert.name}
                                                                onChange={(e) => {
                                                                    const newCerts = [...(editedData.about.certifications || [])]
                                                                    newCerts[index].name = e.target.value
                                                                    updateField(["about", "certifications"], newCerts)
                                                                }}
                                                                className="bg-background border-input"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Issuer</Label>
                                                            <Input
                                                                value={cert.issuer}
                                                                onChange={(e) => {
                                                                    const newCerts = [...(editedData.about.certifications || [])]
                                                                    newCerts[index].issuer = e.target.value
                                                                    updateField(["about", "certifications"], newCerts)
                                                                }}
                                                                className="bg-background border-input"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Year</Label>
                                                            <Input
                                                                value={cert.year}
                                                                onChange={(e) => {
                                                                    const newCerts = [...(editedData.about.certifications || [])]
                                                                    newCerts[index].year = e.target.value
                                                                    updateField(["about", "certifications"], newCerts)
                                                                }}
                                                                className="bg-background border-input"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Credential ID (Optional)</Label>
                                                            <Input
                                                                value={cert.credentialId || ""}
                                                                onChange={(e) => {
                                                                    const newCerts = [...(editedData.about.certifications || [])]
                                                                    newCerts[index].credentialId = e.target.value
                                                                    updateField(["about", "certifications"], newCerts)
                                                                }}
                                                                className="bg-background border-input"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Link (Optional)</Label>
                                                        <Input
                                                            value={cert.link || ""}
                                                            onChange={(e) => {
                                                                const newCerts = [...(editedData.about.certifications || [])]
                                                                newCerts[index].link = e.target.value
                                                                updateField(["about", "certifications"], newCerts)
                                                            }}
                                                            className="bg-background border-input"
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Projects Section */}
                        <TabsContent value="projects">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Projects</h3>
                                        <p className="text-sm text-muted-foreground">Manage your project portfolio</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleSectionVisibility("projects")}
                                            className={sectionOrder.projects === 0 ? "text-green-600" : "text-red-600"}
                                        >
                                            {sectionOrder.projects === 0 ? (
                                                <>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Show Section
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="mr-2 h-4 w-4" />
                                                    Hide Section
                                                </>
                                            )}
                                        </Button>
                                        <Button onClick={addProject} variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Project
                                        </Button>
                                    </div>
                                </div>

                                {editedData.projects.map((project, index) => (
                                    <Card key={project.id} className="bg-card text-card-foreground border-border">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">Project {index + 1}</CardTitle>
                                                <Button
                                                    onClick={() => removeProject(project.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input
                                                        value={project.title}
                                                        onChange={(e) => {
                                                            const newProjects = [...editedData.projects]
                                                            newProjects[index].title = e.target.value
                                                            updateField(["projects"], newProjects)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Image URL</Label>
                                                    <Input
                                                        value={project.image}
                                                        onChange={(e) => {
                                                            const newProjects = [...editedData.projects]
                                                            newProjects[index].image = e.target.value
                                                            updateField(["projects"], newProjects)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={project.description}
                                                    onChange={(e) => {
                                                        const newProjects = [...editedData.projects]
                                                        newProjects[index].description = e.target.value
                                                        updateField(["projects"], newProjects)
                                                    }}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Live Link</Label>
                                                    <Input
                                                        value={project.link || ""}
                                                        onChange={(e) => {
                                                            const newProjects = [...editedData.projects]
                                                            newProjects[index].link = e.target.value
                                                            updateField(["projects"], newProjects)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>GitHub Link</Label>
                                                    <Input
                                                        value={project.github || ""}
                                                        onChange={(e) => {
                                                            const newProjects = [...editedData.projects]
                                                            newProjects[index].github = e.target.value
                                                            updateField(["projects"], newProjects)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Category</Label>
                                                    <Input
                                                        value={project.category || ""}
                                                        onChange={(e) => {
                                                            const newProjects = [...editedData.projects]
                                                            newProjects[index].category = e.target.value
                                                            updateField(["projects"], newProjects)
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="e.g., Web Development"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Status</Label>
                                                    <Select
                                                        value={project.status || "completed"}
                                                        onValueChange={(value) => {
                                                            const newProjects = [...editedData.projects]
                                                            newProjects[index].status = value as "completed" | "in-progress" | "planned"
                                                            updateField(["projects"], newProjects)
                                                        }}
                                                    >
                                                        <SelectTrigger className="bg-background border-input">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                                            <SelectItem value="planned">Planned</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Year</Label>
                                                    <Input
                                                        value={project.year || ""}
                                                        onChange={(e) => {
                                                            const newProjects = [...editedData.projects]
                                                            newProjects[index].year = e.target.value
                                                            updateField(["projects"], newProjects)
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="e.g., 2024"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Role</Label>
                                                <Input
                                                    value={project.role || ""}
                                                    onChange={(e) => {
                                                        const newProjects = [...editedData.projects]
                                                        newProjects[index].role = e.target.value
                                                        updateField(["projects"], newProjects)
                                                    }}
                                                    className="bg-background border-input"
                                                    placeholder="e.g., Lead Developer"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Technologies</Label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {project.tech.map((tech, techIndex) => (
                                                        <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                                                            {tech}
                                                            <button
                                                                onClick={() => {
                                                                    const newProjects = [...editedData.projects]
                                                                    newProjects[index].tech = newProjects[index].tech.filter((_, i) => i !== techIndex)
                                                                    updateField(["projects"], newProjects)
                                                                }}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Input
                                                    placeholder="Add technology and press Enter"
                                                    onKeyPress={(e) => {
                                                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                            const newProjects = [...editedData.projects]
                                                            newProjects[index].tech.push(e.currentTarget.value.trim())
                                                            updateField(["projects"], newProjects)
                                                            e.currentTarget.value = ""
                                                        }
                                                    }}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Features</Label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {(project.features || []).map((feature, featureIndex) => (
                                                        <Badge key={featureIndex} variant="outline" className="flex items-center gap-1">
                                                            {feature}
                                                            <button
                                                                onClick={() => removeProjectFeature(index, feature)}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Input
                                                    placeholder="Add feature and press Enter"
                                                    onKeyPress={(e) => {
                                                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                            addProjectFeature(index, e.currentTarget.value)
                                                            e.currentTarget.value = ""
                                                        }
                                                    }}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Experience Section */}
                        <TabsContent value="experience">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Experience</h3>
                                        <p className="text-sm text-muted-foreground">Manage your work experience</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleSectionVisibility("experience")}
                                            className={sectionOrder.experience === 0 ? "text-green-600" : "text-red-600"}
                                        >
                                            {sectionOrder.experience === 0 ? (
                                                <>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Show Section
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="mr-2 h-4 w-4" />
                                                    Hide Section
                                                </>
                                            )}
                                        </Button>
                                        <Button onClick={addExperience} variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Experience
                                        </Button>
                                    </div>
                                </div>

                                {editedData.experience.map((exp, index) => (
                                    <Card key={exp.id} className="bg-card text-card-foreground border-border">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">Experience {index + 1}</CardTitle>
                                                <Button
                                                    onClick={() => removeExperience(exp.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Company</Label>
                                                    <Input
                                                        value={exp.company}
                                                        onChange={(e) => {
                                                            const newExperience = [...editedData.experience]
                                                            newExperience[index].company = e.target.value
                                                            updateField(["experience"], newExperience)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Role</Label>
                                                    <Input
                                                        value={exp.role}
                                                        onChange={(e) => {
                                                            const newExperience = [...editedData.experience]
                                                            newExperience[index].role = e.target.value
                                                            updateField(["experience"], newExperience)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Year</Label>
                                                    <Input
                                                        value={exp.year}
                                                        onChange={(e) => {
                                                            const newExperience = [...editedData.experience]
                                                            newExperience[index].year = e.target.value
                                                            updateField(["experience"], newExperience)
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="e.g., 2022 - Present"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Location</Label>
                                                    <Input
                                                        value={exp.location || ""}
                                                        onChange={(e) => {
                                                            const newExperience = [...editedData.experience]
                                                            newExperience[index].location = e.target.value
                                                            updateField(["experience"], newExperience)
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="e.g., New York, USA"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Type</Label>
                                                    <Select
                                                        value={exp.type || "full-time"}
                                                        onValueChange={(value) => {
                                                            const newExperience = [...editedData.experience]
                                                            newExperience[index].type = value as
                                                                | "full-time"
                                                                | "part-time"
                                                                | "contract"
                                                                | "internship"
                                                                | "freelance"
                                                            updateField(["experience"], newExperience)
                                                        }}
                                                    >
                                                        <SelectTrigger className="bg-background border-input">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="full-time">Full-time</SelectItem>
                                                            <SelectItem value="part-time">Part-time</SelectItem>
                                                            <SelectItem value="contract">Contract</SelectItem>
                                                            <SelectItem value="internship">Internship</SelectItem>
                                                            <SelectItem value="freelance">Freelance</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Company Logo URL</Label>
                                                    <Input
                                                        value={exp.companyLogo || ""}
                                                        onChange={(e) => {
                                                            const newExperience = [...editedData.experience]
                                                            newExperience[index].companyLogo = e.target.value
                                                            updateField(["experience"], newExperience)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Company Website</Label>
                                                    <Input
                                                        value={exp.companyWebsite || ""}
                                                        onChange={(e) => {
                                                            const newExperience = [...editedData.experience]
                                                            newExperience[index].companyWebsite = e.target.value
                                                            updateField(["experience"], newExperience)
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`current-${index}`}
                                                    checked={exp.current || false}
                                                    onCheckedChange={(checked) => {
                                                        const newExperience = [...editedData.experience]
                                                        newExperience[index].current = checked as boolean
                                                        updateField(["experience"], newExperience)
                                                    }}
                                                />
                                                <Label htmlFor={`current-${index}`}>Currently working here</Label>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={exp.description}
                                                    onChange={(e) => {
                                                        const newExperience = [...editedData.experience]
                                                        newExperience[index].description = e.target.value
                                                        updateField(["experience"], newExperience)
                                                    }}
                                                    className="bg-background border-input"
                                                />
                                            </div>

                                            {/* Achievements */}
                                            <div className="space-y-2">
                                                <Label>Achievements</Label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {(exp.achievements || []).map((achievement, achIndex) => (
                                                        <Badge key={achIndex} variant="outline" className="flex items-center gap-1">
                                                            {achievement}
                                                            <button
                                                                onClick={() => removeExperienceAchievement(index, achievement)}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Input
                                                    placeholder="Add achievement and press Enter"
                                                    onKeyPress={(e) => {
                                                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                            addExperienceAchievement(index, e.currentTarget.value)
                                                            e.currentTarget.value = ""
                                                        }
                                                    }}
                                                    className="bg-background border-input"
                                                />
                                            </div>

                                            {/* Technologies */}
                                            <div className="space-y-2">
                                                <Label>Technologies</Label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {(exp.technologies || []).map((tech, techIndex) => (
                                                        <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                                                            {tech}
                                                            <button
                                                                onClick={() => removeExperienceTechnology(index, tech)}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Input
                                                    placeholder="Add technology and press Enter"
                                                    onKeyPress={(e) => {
                                                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                            addExperienceTechnology(index, e.currentTarget.value)
                                                            e.currentTarget.value = ""
                                                        }
                                                    }}
                                                    className="bg-background border-input"
                                                />
                                            </div>

                                            {/* Responsibilities */}
                                            <div className="space-y-2">
                                                <Label>Responsibilities</Label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {(exp.responsibilities || []).map((resp, respIndex) => (
                                                        <Badge key={respIndex} variant="outline" className="flex items-center gap-1">
                                                            {resp}
                                                            <button
                                                                onClick={() => removeExperienceResponsibility(index, resp)}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Input
                                                    placeholder="Add responsibility and press Enter"
                                                    onKeyPress={(e) => {
                                                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                            addExperienceResponsibility(index, e.currentTarget.value)
                                                            e.currentTarget.value = ""
                                                        }
                                                    }}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="skills">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Skills Section</h3>
                                        <p className="text-sm text-muted-foreground">Manage your technical skills</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleSectionVisibility("skills")}
                                        className={sectionOrder.skills === 0 ? "text-green-600" : "text-red-600"}
                                    >
                                        {sectionOrder.skills === 0 ? (
                                            <>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Show Section
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="mr-2 h-4 w-4" />
                                                Hide Section
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <CardTitle>Skills</CardTitle>
                                        <CardDescription>Manage your technical skills</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Basic Skills Categories */}
                                        {(
                                            [
                                                "frontend",
                                                "backend",
                                                "tools",
                                                "databases",
                                                "cloud",
                                                "mobile",
                                                "design",
                                                "testing",
                                                "devops",
                                            ] as const
                                        ).map((category) => (
                                            <div key={category} className="space-y-3">
                                                <Label className="capitalize text-base font-medium">{category} Skills</Label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {((editedData.skills[category] as string[]) || []).map((skill, index) => (
                                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                            {skill}
                                                            <button
                                                                onClick={() => removeSkill(category, skill)}
                                                                className="ml-1 hover:text-destructive"
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Input
                                                    placeholder={`Add ${category} skill and press Enter`}
                                                    onKeyPress={(e) => {
                                                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                                            addSkill(category, e.currentTarget.value)
                                                            e.currentTarget.value = ""
                                                        }
                                                    }}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                        ))}

                                        <Separator />

                                        {/* Programming Languages with Proficiency */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-medium">Programming Languages</Label>
                                                <Button onClick={addLanguageSkill} variant="outline" size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Language
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                {(editedData.skills.languages || []).map((lang, index) => (
                                                    <div
                                                        key={index}
                                                        className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 border border-border rounded-lg"
                                                    >
                                                        <div className="space-y-2">
                                                            <Label>Language</Label>
                                                            <Input
                                                                value={lang.name}
                                                                onChange={(e) => {
                                                                    const newLanguages = [...(editedData.skills.languages || [])]
                                                                    newLanguages[index].name = e.target.value
                                                                    updateField(["skills", "languages"], newLanguages)
                                                                }}
                                                                className="bg-background border-input"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Proficiency</Label>
                                                            <Select
                                                                value={lang.proficiency}
                                                                onValueChange={(value) => {
                                                                    const newLanguages = [...(editedData.skills.languages || [])]
                                                                    newLanguages[index].proficiency = value as
                                                                        | "beginner"
                                                                        | "intermediate"
                                                                        | "advanced"
                                                                        | "expert"
                                                                    updateField(["skills", "languages"], newLanguages)
                                                                }}
                                                            >
                                                                <SelectTrigger className="bg-background border-input">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="beginner">Beginner</SelectItem>
                                                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                                                    <SelectItem value="advanced">Advanced</SelectItem>
                                                                    <SelectItem value="expert">Expert</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Years of Experience</Label>
                                                            <Input
                                                                type="number"
                                                                value={lang.yearsOfExperience || ""}
                                                                onChange={(e) => {
                                                                    const newLanguages = [...(editedData.skills.languages || [])]
                                                                    newLanguages[index].yearsOfExperience = e.target.value
                                                                        ? Number.parseInt(e.target.value)
                                                                        : undefined
                                                                    updateField(["skills", "languages"], newLanguages)
                                                                }}
                                                                className="bg-background border-input"
                                                            />
                                                        </div>
                                                        <div className="flex items-end">
                                                            <Button
                                                                onClick={() => removeLanguageSkill(index)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive w-full"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Frameworks with Proficiency */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-medium">Frameworks</Label>
                                                <Button onClick={addFrameworkSkill} variant="outline" size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Framework
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                {(editedData.skills.frameworks || []).map((framework, index) => (
                                                    <div
                                                        key={index}
                                                        className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 border border-border rounded-lg"
                                                    >
                                                        <div className="space-y-2">
                                                            <Label>Framework</Label>
                                                            <Input
                                                                value={framework.name}
                                                                onChange={(e) => {
                                                                    const newFrameworks = [...(editedData.skills.frameworks || [])]
                                                                    newFrameworks[index].name = e.target.value
                                                                    updateField(["skills", "frameworks"], newFrameworks)
                                                                }}
                                                                className="bg-background border-input"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Category</Label>
                                                            <Input
                                                                value={framework.category}
                                                                onChange={(e) => {
                                                                    const newFrameworks = [...(editedData.skills.frameworks || [])]
                                                                    newFrameworks[index].category = e.target.value
                                                                    updateField(["skills", "frameworks"], newFrameworks)
                                                                }}
                                                                className="bg-background border-input"
                                                                placeholder="e.g., Frontend, Backend"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Proficiency</Label>
                                                            <Select
                                                                value={framework.proficiency}
                                                                onValueChange={(value) => {
                                                                    const newFrameworks = [...(editedData.skills.frameworks || [])]
                                                                    newFrameworks[index].proficiency = value as
                                                                        | "beginner"
                                                                        | "intermediate"
                                                                        | "advanced"
                                                                        | "expert"
                                                                    updateField(["skills", "frameworks"], newFrameworks)
                                                                }}
                                                            >
                                                                <SelectTrigger className="bg-background border-input">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="beginner">Beginner</SelectItem>
                                                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                                                    <SelectItem value="advanced">Advanced</SelectItem>
                                                                    <SelectItem value="expert">Expert</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex items-end">
                                                            <Button
                                                                onClick={() => removeFrameworkSkill(index)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive w-full"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Education Section */}
                        <TabsContent value="education">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Education</h3>
                                        <p className="text-sm text-muted-foreground">Manage your educational background</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleSectionVisibility("education")}
                                            className={sectionOrder.education === 0 ? "text-green-600" : "text-red-600"}
                                        >
                                            {sectionOrder.education === 0 ? (
                                                <>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Show Section
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="mr-2 h-4 w-4" />
                                                    Hide Section
                                                </>
                                            )}
                                        </Button>
                                        <Button onClick={addEducation} variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Education
                                        </Button>
                                    </div>
                                </div>

                                {(editedData.education || []).map((edu, index) => (
                                    <Card key={edu.id} className="bg-card text-card-foreground border-border">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">Education {index + 1}</CardTitle>
                                                <Button
                                                    onClick={() => removeEducation(edu.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Institution</Label>
                                                    <Input
                                                        value={edu.institution}
                                                        onChange={(e) => {
                                                            const newEducation = [...(editedData.education || [])]
                                                            newEducation[index].institution = e.target.value
                                                            updateField(["education"], newEducation)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Degree</Label>
                                                    <Input
                                                        value={edu.degree}
                                                        onChange={(e) => {
                                                            const newEducation = [...(editedData.education || [])]
                                                            newEducation[index].degree = e.target.value
                                                            updateField(["education"], newEducation)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Year</Label>
                                                    <Input
                                                        value={edu.year}
                                                        onChange={(e) => {
                                                            const newEducation = [...(editedData.education || [])]
                                                            newEducation[index].year = e.target.value
                                                            updateField(["education"], newEducation)
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="e.g., 2020 - 2024"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Location</Label>
                                                    <Input
                                                        value={edu.location || ""}
                                                        onChange={(e) => {
                                                            const newEducation = [...(editedData.education || [])]
                                                            newEducation[index].location = e.target.value
                                                            updateField(["education"], newEducation)
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="e.g., New York, USA"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>GPA</Label>
                                                    <Input
                                                        value={edu.gpa || ""}
                                                        onChange={(e) => {
                                                            const newEducation = [...(editedData.education || [])]
                                                            newEducation[index].gpa = e.target.value
                                                            updateField(["education"], newEducation)
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="e.g., 3.8/4.0"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Major</Label>
                                                    <Input
                                                        value={edu.major || ""}
                                                        onChange={(e) => {
                                                            const newEducation = [...(editedData.education || [])]
                                                            newEducation[index].major = e.target.value
                                                            updateField(["education"], newEducation)
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="e.g., Computer Science"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Logo URL</Label>
                                                    <Input
                                                        value={edu.logo || ""}
                                                        onChange={(e) => {
                                                            const newEducation = [...(editedData.education || [])]
                                                            newEducation[index].logo = e.target.value
                                                            updateField(["education"], newEducation)
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={edu.description}
                                                    onChange={(e) => {
                                                        const newEducation = [...(editedData.education || [])]
                                                        newEducation[index].description = e.target.value
                                                        updateField(["education"], newEducation)
                                                    }}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Contacts Section */}
                        <TabsContent value="contacts">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Contact Information & Skills</h3>
                                        <p className="text-sm text-muted-foreground">Your contact details, social links, and skills</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleSectionVisibility("contacts")}
                                        className={sectionOrder.contacts === 0 ? "text-green-600" : "text-red-600"}
                                    >
                                        {sectionOrder.contacts === 0 ? (
                                            <>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Show Section
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="mr-2 h-4 w-4" />
                                                Hide Section
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <CardTitle>Contact Information</CardTitle>
                                        <CardDescription>Your contact details and social links</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-email">Email</Label>
                                            <Input
                                                id="contact-email"
                                                type="email"
                                                value={editedData.contacts.email}
                                                onChange={(e) => updateField(["contacts", "email"], e.target.value)}
                                                className="bg-background border-input"
                                            />
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-github">GitHub URL</Label>
                                                <Input
                                                    id="contact-github"
                                                    value={editedData.contacts.github || ""}
                                                    onChange={(e) => updateField(["contacts", "github"], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="https://github.com/username"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-linkedin">LinkedIn URL</Label>
                                                <Input
                                                    id="contact-linkedin"
                                                    value={editedData.contacts.linkedin || ""}
                                                    onChange={(e) => updateField(["contacts", "linkedin"], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="https://linkedin.com/in/username"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-twitter">Twitter URL</Label>
                                                <Input
                                                    id="contact-twitter"
                                                    value={editedData.contacts.twitter || ""}
                                                    onChange={(e) => updateField(["contacts", "twitter"], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="https://twitter.com/username"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-discord">Discord</Label>
                                                <Input
                                                    id="contact-discord"
                                                    value={editedData.contacts.discord || ""}
                                                    onChange={(e) => updateField(["contacts", "discord"], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="username#1234"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-telegram">Telegram</Label>
                                                <Input
                                                    id="contact-telegram"
                                                    value={editedData.contacts.telegram || ""}
                                                    onChange={(e) => updateField(["contacts", "telegram"], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="@username"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Skills Section */}

                            </div>
                        </TabsContent>

                        {/* Theme Section */}
                        <TabsContent value="theme">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <CardTitle>Theme Settings</CardTitle>
                                        <CardDescription>Customize colors by selecting a theme mode or pasting a configuration</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Theme Mode</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={selectedThemeMode === 'light' ? 'default' : 'outline'}
                                                    onClick={() => {
                                                        setSelectedThemeMode('light');
                                                        updateField(['theme', 'currentMode'], 'light');
                                                    }}
                                                    size="sm"
                                                >
                                                    Light
                                                </Button>
                                                <Button
                                                    variant={selectedThemeMode === 'dark' ? 'default' : 'outline'}
                                                    onClick={() => {
                                                        setSelectedThemeMode('dark');
                                                        updateField(['theme', 'currentMode'], 'dark');
                                                    }}
                                                    size="sm"
                                                >
                                                    Dark
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Label>Recommended: Paste Theme Configuration from TweakCn</Label>
                                                <a
                                                    href="https://tweakcn.com/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    <ArrowUp className='rotate-45 h-4 w-4' />
                                                </a>
                                            </div>
                                            <Textarea
                                                placeholder="Paste your theme configuration here (e.g., :root { --background: oklch(0.9751 0.0127 244.2507); ... })"
                                                className="bg-background border-input font-mono text-sm h-25"
                                                onChange={(e) => {
                                                    const config = e.target.value;
                                                    try {
                                                        const parsed = parseThemeConfig(config);
                                                        // console.log('Parsed theme configuration:', parsed);
                                                        updateField(['theme', 'styles'], parsed);
                                                        // console.log('Updated theme styles:', editedData.theme.styles);
                                                    } catch (error) {
                                                        console.error('Invalid theme configuration:', error);
                                                    }
                                                }}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Paste CSS custom properties to apply theme. Supports OKLCH values for light and dark modes.
                                            </p>
                                        </div>
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="primary-colors">
                                                <AccordionTrigger className="capitalize">Primary Colors</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].primary)}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'primary'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].primary)}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'primary'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode].primary}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'primary'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['primary-foreground'])}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'primary-foreground'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['primary-foreground'])}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'primary-foreground'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode]['primary-foreground']}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'primary-foreground'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="secondary-colors">
                                                <AccordionTrigger className="capitalize">Secondary Colors</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].secondary)}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'secondary'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].secondary)}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'secondary'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode].secondary}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'secondary'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['secondary-foreground'])}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'secondary-foreground'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['secondary-foreground'])}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'secondary-foreground'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode]['secondary-foreground']}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'secondary-foreground'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="background-colors">
                                                <AccordionTrigger className="capitalize">Background Colors</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].background)}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'background'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].background)}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'background'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode].background}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'background'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].foreground)}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'foreground'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].foreground)}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'foreground'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode].foreground}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'foreground'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="card-colors">
                                                <AccordionTrigger className="capitalize">Card Colors</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].card)}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'card'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].card)}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'card'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode].card}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'card'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['card-foreground'])}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'card-foreground'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['card-foreground'])}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'card-foreground'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode]['card-foreground']}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'card-foreground'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="accent-colors">
                                                <AccordionTrigger className="capitalize">Accent Colors</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].accent)}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'accent'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].accent)}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'accent'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode].accent}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'accent'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['accent-foreground'])}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'accent-foreground'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['accent-foreground'])}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'accent-foreground'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode]['accent-foreground']}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'accent-foreground'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="border-colors">
                                                <AccordionTrigger className="capitalize">Border Colors</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].border)}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'border'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].border)}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'border'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode].border}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'border'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].input)}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'input'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].input)}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'input'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode].input}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'input'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="destructive-colors">
                                                <AccordionTrigger className="capitalize">Destructive Colors</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].destructive)}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'destructive'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].destructive)}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'destructive'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode].destructive}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'destructive'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['destructive-foreground'])}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'destructive-foreground'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['destructive-foreground'])}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'destructive-foreground'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode]['destructive-foreground']}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'destructive-foreground'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="muted-colors">
                                                <AccordionTrigger className="capitalize">Muted Colors</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].muted)}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'muted'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode].muted)}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'muted'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode].muted}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'muted'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10">
                                                                <input
                                                                    type="color"
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['muted-foreground'])}
                                                                    onChange={(e) => updateColorField(['theme', 'styles', selectedThemeMode, 'muted-foreground'], e.target.value)}
                                                                    className="w-full h-full rounded border border-input cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>Hex</Label>
                                                                <Input
                                                                    value={oklchToHex(editedData.theme.styles[selectedThemeMode]['muted-foreground'])}
                                                                    onChange={(e) => {
                                                                        const hex = e.target.value;
                                                                        if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{6}){1,2}$/.test(hex)) {
                                                                            updateColorField(['theme', 'styles', selectedThemeMode, 'muted-foreground'], hex);
                                                                        }
                                                                    }}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label>OKLCH</Label>
                                                                <Input
                                                                    value={editedData.theme.styles[selectedThemeMode]['muted-foreground']}
                                                                    onChange={(e) => updateField(['theme', 'styles', selectedThemeMode, 'muted-foreground'], e.target.value)}
                                                                    className="bg-background border-input font-mono text-sm"
                                                                    placeholder="oklch(50% 0.1 180)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </CardContent>
                                </Card>
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <CardTitle>Theme Preview</CardTitle>
                                        <CardDescription>Preview of selected theme colors with portfolio components</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div
                                            className="p-4 rounded-lg border space-y-4"
                                            style={{
                                                backgroundColor: oklchToHex(editedData.theme.styles[selectedThemeMode].background),
                                                color: oklchToHex(editedData.theme.styles[selectedThemeMode].foreground),
                                                borderColor: oklchToHex(editedData.theme.styles[selectedThemeMode].border),
                                            }}
                                        >
                                            <div className="text-sm font-medium">Preview</div>
                                            <div className="flex gap-2 flex-wrap">
                                                <Button
                                                    className="w-fit"
                                                    style={{
                                                        backgroundColor: oklchToHex(editedData.theme.styles[selectedThemeMode].primary),
                                                        color: oklchToHex(editedData.theme.styles[selectedThemeMode]['primary-foreground']),
                                                    }}
                                                >
                                                    Primary Button
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="w-fit"
                                                    style={{
                                                        backgroundColor: oklchToHex(editedData.theme.styles[selectedThemeMode].secondary),
                                                        color: oklchToHex(editedData.theme.styles[selectedThemeMode]['secondary-foreground']),
                                                    }}
                                                >
                                                    Secondary Button
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-fit"
                                                    style={{
                                                        borderColor: oklchToHex(editedData.theme.styles[selectedThemeMode].border),
                                                        color: oklchToHex(editedData.theme.styles[selectedThemeMode].foreground),
                                                    }}
                                                >
                                                    Outline Button
                                                </Button>
                                            </div>
                                            <Separator style={{ backgroundColor: oklchToHex(editedData.theme.styles[selectedThemeMode].border) }} />
                                            <Card
                                                style={{
                                                    backgroundColor: oklchToHex(editedData.theme.styles[selectedThemeMode].card),
                                                    color: oklchToHex(editedData.theme.styles[selectedThemeMode]['card-foreground']),
                                                    borderColor: oklchToHex(editedData.theme.styles[selectedThemeMode].border),
                                                }}
                                            >
                                                <CardHeader>
                                                    <CardTitle>Project Card</CardTitle>
                                                    <CardDescription style={{ color: oklchToHex(editedData.theme.styles[selectedThemeMode]['muted-foreground']) }}>
                                                        Showcase your projects
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge
                                                            style={{
                                                                backgroundColor: oklchToHex(editedData.theme.styles[selectedThemeMode].accent),
                                                                color: oklchToHex(editedData.theme.styles[selectedThemeMode]['accent-foreground']),
                                                            }}
                                                        >
                                                            React
                                                        </Badge>
                                                        <Badge
                                                            style={{
                                                                backgroundColor: oklchToHex(editedData.theme.styles[selectedThemeMode].secondary),
                                                                color: oklchToHex(editedData.theme.styles[selectedThemeMode]['secondary-foreground']),
                                                            }}
                                                        >
                                                            TypeScript
                                                        </Badge>
                                                    </div>
                                                    <Input
                                                        placeholder="Project link"
                                                        className="w-full"
                                                        style={{
                                                            backgroundColor: oklchToHex(editedData.theme.styles[selectedThemeMode].input),
                                                            color: oklchToHex(editedData.theme.styles[selectedThemeMode].foreground),
                                                            borderColor: oklchToHex(editedData.theme.styles[selectedThemeMode].border),
                                                        }}
                                                    />
                                                </CardContent>
                                            </Card>
                                            <div
                                                className="px-3 py-2 rounded text-sm"
                                                style={{
                                                    backgroundColor: oklchToHex(editedData.theme.styles[selectedThemeMode].accent),
                                                    color: oklchToHex(editedData.theme.styles[selectedThemeMode]['accent-foreground']),
                                                }}
                                            >
                                                Accent Element
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {isDirty && (
                    <div className="fixed bottom-6 right-6 bg-card border border-border rounded-lg p-4 shadow-lg z-50">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">You have unsaved changes</span>
                            <Button onClick={handleSave} disabled={isLoading} size="sm">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Now
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
