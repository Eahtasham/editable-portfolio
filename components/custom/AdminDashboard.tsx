"use client";

import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Plus, Trash2, User, Briefcase, FolderOpen, Mail, Palette, GripVertical, ArrowUp, ArrowDown, GraduationCap, Settings } from 'lucide-react';
import { updatePortfolioData } from '../../lib/portfolio-api';
import { PortfolioData } from '../../context/PortfolioContext';
import { toast } from 'sonner';
import { oklch, formatHex, converter } from 'culori';

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
  hero: number;
  about: number;
  projects: number;
  experience: number;
  education: number;
  contacts: number;
}

export default function AdminDashboard() {
    const { isAuthenticated, data: portfolioData, refreshData } = usePortfolio();
    const router = useRouter();
    
    const [editedData, setEditedData] = useState<PortfolioData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('dark');
    const [sectionOrder, setSectionOrder] = useState<SectionOrder>({
        hero: 1,
        about: 2,
        projects: 3,
        experience: 4,
        education: 5,
        contacts: 6
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (portfolioData) {
            const data = JSON.parse(JSON.stringify(portfolioData));
            // Add education if it doesn't exist
            if (!data.education) {
                data.education = [];
            }
            // Add sectionOrder if it doesn't exist
            if (!data.sectionOrder) {
                data.sectionOrder = sectionOrder;
            } else {
                setSectionOrder(data.sectionOrder);
            }
            setEditedData(data);
        }
    }, [portfolioData]);

    const handleSave = async () => {
        if (!editedData || !portfolioData) return;
        
        setIsLoading(true);
        try {
            await updatePortfolioData(portfolioData, { ...editedData, sectionOrder });
            await refreshData();
            setIsDirty(false);
            toast.success('Portfolio updated successfully!');
        } catch (error) {
            console.error('Error updating portfolio:', error);
            toast.error('Failed to update portfolio');
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = (path: string[], value: unknown) => {
        if (!editedData) return;
        
        const newData = JSON.parse(JSON.stringify(editedData));
        let current = newData;
        
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        
        current[path[path.length - 1]] = value;
        setEditedData(newData);
        setIsDirty(true);
    };

    const updateColorField = (path: string[], hexColor: string) => {
        const oklchColor = hexToOklch(hexColor);
        updateField(path, oklchColor);
    };

    // Education functions
    const addEducation = () => {
        if (!editedData) return;
        const newEducation = {
            id: Date.now().toString(),
            institution: "New Institution",
            degree: "New Degree",
            year: "2020 - 2024",
            description: "Description of education",
        };
        const currentEducation = editedData.education || [];
        updateField(['education'], [...currentEducation, newEducation]);
    };

    const removeEducation = (id: string) => {
        if (!editedData) return;
        const currentEducation = editedData.education || [];
        updateField(['education'], currentEducation.filter(e => e.id !== id));
    };

    // Section ordering functions
    const updateSectionOrder = (section: keyof SectionOrder, newOrder: number) => {
        setSectionOrder(prev => ({
            ...prev,
            [section]: newOrder
        }));
        setIsDirty(true);
    };

    // All existing functions (addProject, removeProject, etc.) remain the same...
    const addProject = () => {
        if (!editedData) return;
        const newProject = {
            id: Date.now().toString(),
            title: "New Project",
            description: "Project description",
            tech: [],
            link: "",
            github: "",
            image: "/placeholder.svg?height=300&width=400",
        };
        updateField(['projects'], [...editedData.projects, newProject]);
    };

    const removeProject = (id: string) => {
        if (!editedData) return;
        updateField(['projects'], editedData.projects.filter(p => p.id !== id));
    };

    const addExperience = () => {
        if (!editedData) return;
        const newExperience = {
            id: Date.now().toString(),
            company: "New Company",
            role: "New Role",
            year: "2024 - Present",
            description: "Description of role",
        };
        updateField(['experience'], [...editedData.experience, newExperience]);
    };

    const removeExperience = (id: string) => {
        if (!editedData) return;
        updateField(['experience'], editedData.experience.filter(e => e.id !== id));
    };

    const addSkill = (category: 'frontend' | 'backend' | 'tools', skill: string) => {
        if (!editedData || !skill.trim()) return;
        const currentSkills = editedData.skills[category];
        if (!currentSkills.includes(skill.trim())) {
            updateField(['skills', category], [...currentSkills, skill.trim()]);
        }
    };

    const removeSkill = (category: 'frontend' | 'backend' | 'tools', skill: string) => {
        if (!editedData) return;
        updateField(['skills', category], editedData.skills[category].filter(s => s !== skill));
    };

    if (!editedData) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

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

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="xl:col-span-3">
                        <Tabs defaultValue="hero" className="space-y-4">
                            <div className="overflow-x-auto">
                                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 bg-muted min-w-max">
                                    <TabsTrigger value="hero" className="flex items-center gap-1 text-xs lg:text-sm">
                                        <User className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span className="hidden sm:inline">Hero</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="about" className="flex items-center gap-1 text-xs lg:text-sm">
                                        <User className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span className="hidden sm:inline">About</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="projects" className="flex items-center gap-1 text-xs lg:text-sm">
                                        <FolderOpen className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span className="hidden sm:inline">Projects</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="experience" className="flex items-center gap-1 text-xs lg:text-sm">
                                        <Briefcase className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span className="hidden sm:inline">Experience</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="education" className="flex items-center gap-1 text-xs lg:text-sm">
                                        <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span className="hidden sm:inline">Education</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="contacts" className="flex items-center gap-1 text-xs lg:text-sm">
                                        <Mail className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span className="hidden sm:inline">Contacts</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="settings" className="flex items-center gap-1 text-xs lg:text-sm">
                                        <Settings className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span className="hidden sm:inline">Settings</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Hero Section */}
                            <TabsContent value="hero">
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <CardTitle>Hero Section</CardTitle>
                                        <CardDescription>Main landing section content</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-heading">Heading</Label>
                                                <Input
                                                    id="hero-heading"
                                                    value={editedData.hero.heading}
                                                    onChange={(e) => updateField(['hero', 'heading'], e.target.value)}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-subheading">Subheading</Label>
                                                <Input
                                                    id="hero-subheading"
                                                    value={editedData.hero.subheading}
                                                    onChange={(e) => updateField(['hero', 'subheading'], e.target.value)}
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
                                                    onChange={(e) => updateField(['hero', 'cta'], e.target.value)}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero-image">Image URL</Label>
                                                <Input
                                                    id="hero-image"
                                                    value={editedData.hero.image}
                                                    onChange={(e) => updateField(['hero', 'image'], e.target.value)}
                                                    className="bg-background border-input"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* About Section */}
                            <TabsContent value="about">
                                <Card className="bg-card text-card-foreground border-border">
                                    <CardHeader>
                                        <CardTitle>About Section</CardTitle>
                                        <CardDescription>About me content (Markdown supported)</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Label htmlFor="about-markdown">Content</Label>
                                            <Textarea
                                                id="about-markdown"
                                                value={editedData.about.markdown}
                                                onChange={(e) => updateField(['about', 'markdown'], e.target.value)}
                                                className="min-h-[200px] bg-background border-input"
                                                placeholder="Write your about content in markdown..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Projects Section - Same as before */}
                            <TabsContent value="projects">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">Projects</h3>
                                            <p className="text-sm text-muted-foreground">Manage your project portfolio</p>
                                        </div>
                                        <Button onClick={addProject} variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Project
                                        </Button>
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
                                                                const newProjects = [...editedData.projects];
                                                                newProjects[index].title = e.target.value;
                                                                updateField(['projects'], newProjects);
                                                            }}
                                                            className="bg-background border-input"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Image URL</Label>
                                                        <Input
                                                            value={project.image}
                                                            onChange={(e) => {
                                                                const newProjects = [...editedData.projects];
                                                                newProjects[index].image = e.target.value;
                                                                updateField(['projects'], newProjects);
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
                                                            const newProjects = [...editedData.projects];
                                                            newProjects[index].description = e.target.value;
                                                            updateField(['projects'], newProjects);
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Live Link</Label>
                                                        <Input
                                                            value={project.link}
                                                            onChange={(e) => {
                                                                const newProjects = [...editedData.projects];
                                                                newProjects[index].link = e.target.value;
                                                                updateField(['projects'], newProjects);
                                                            }}
                                                            className="bg-background border-input"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>GitHub Link</Label>
                                                        <Input
                                                            value={project.github}
                                                            onChange={(e) => {
                                                                const newProjects = [...editedData.projects];
                                                                newProjects[index].github = e.target.value;
                                                                updateField(['projects'], newProjects);
                                                            }}
                                                            className="bg-background border-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Technologies</Label>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {project.tech.map((tech, techIndex) => (
                                                            <Badge
                                                                key={techIndex}
                                                                variant="secondary"
                                                                className="flex items-center gap-1"
                                                            >
                                                                {tech}
                                                                <button
                                                                    onClick={() => {
                                                                        const newProjects = [...editedData.projects];
                                                                        newProjects[index].tech = newProjects[index].tech.filter((_, i) => i !== techIndex);
                                                                        updateField(['projects'], newProjects);
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
                                                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                                const newProjects = [...editedData.projects];
                                                                newProjects[index].tech.push(e.currentTarget.value.trim());
                                                                updateField(['projects'], newProjects);
                                                                e.currentTarget.value = '';
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

                            {/* Experience Section - Same as before */}
                            <TabsContent value="experience">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">Experience</h3>
                                            <p className="text-sm text-muted-foreground">Manage your work experience</p>
                                        </div>
                                        <Button onClick={addExperience} variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Experience
                                        </Button>
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
                                                                const newExperience = [...editedData.experience];
                                                                newExperience[index].company = e.target.value;
                                                                updateField(['experience'], newExperience);
                                                            }}
                                                            className="bg-background border-input"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Role</Label>
                                                        <Input
                                                            value={exp.role}
                                                            onChange={(e) => {
                                                                const newExperience = [...editedData.experience];
                                                                newExperience[index].role = e.target.value;
                                                                updateField(['experience'], newExperience);
                                                            }}
                                                            className="bg-background border-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Year</Label>
                                                    <Input
                                                        value={exp.year}
                                                        onChange={(e) => {
                                                            const newExperience = [...editedData.experience];
                                                            newExperience[index].year = e.target.value;
                                                            updateField(['experience'], newExperience);
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="e.g., 2022 - Present"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea
                                                        value={exp.description}
                                                        onChange={(e) => {
                                                            const newExperience = [...editedData.experience];
                                                            newExperience[index].description = e.target.value;
                                                            updateField(['experience'], newExperience);
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
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
                                        <Button onClick={addEducation} variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Education
                                        </Button>
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
                                                                const newEducation = [...(editedData.education || [])];
                                                                newEducation[index].institution = e.target.value;
                                                                updateField(['education'], newEducation);
                                                            }}
                                                            className="bg-background border-input"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Degree</Label>
                                                        <Input
                                                            value={edu.degree}
                                                            onChange={(e) => {
                                                                const newEducation = [...(editedData.education || [])];
                                                                newEducation[index].degree = e.target.value;
                                                                updateField(['education'], newEducation);
                                                            }}
                                                            className="bg-background border-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Year</Label>
                                                    <Input
                                                        value={edu.year}
                                                        onChange={(e) => {
                                                            const newEducation = [...(editedData.education || [])];
                                                            newEducation[index].year = e.target.value;
                                                            updateField(['education'], newEducation);
                                                        }}
                                                        className="bg-background border-input"
                                                        placeholder="e.g., 2020 - 2024"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea
                                                        value={edu.description}
                                                        onChange={(e) => {
                                                            const newEducation = [...(editedData.education || [])];
                                                            newEducation[index].description = e.target.value;
                                                            updateField(['education'], newEducation);
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Contacts Section - Same as before */}
                            <TabsContent value="contacts">
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
                                                onChange={(e) => updateField(['contacts', 'email'], e.target.value)}
                                                className="bg-background border-input"
                                            />
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-github">GitHub URL</Label>
                                                <Input
                                                    id="contact-github"
                                                    value={editedData.contacts.github}
                                                    onChange={(e) => updateField(['contacts', 'github'], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="https://github.com/username"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-linkedin">LinkedIn URL</Label>
                                                <Input
                                                    id="contact-linkedin"
                                                    value={editedData.contacts.linkedin}
                                                    onChange={(e) => updateField(['contacts', 'linkedin'], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="https://linkedin.com/in/username"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-twitter">Twitter URL</Label>
                                                <Input
                                                    id="contact-twitter"
                                                    value={editedData.contacts.twitter}
                                                    onChange={(e) => updateField(['contacts', 'twitter'], e.target.value)}
                                                    className="bg-background border-input"
                                                    placeholder="https://twitter.com/username"
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h4 className="text-sm font-medium">Skills</h4>
                                            
                                            {(['frontend', 'backend', 'tools'] as const).map((category) => (
                                                <div key={category} className="space-y-2">
                                                    <Label className="capitalize">{category}</Label>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {editedData.skills[category].map((skill, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                                className="flex items-center gap-1"
                                                            >
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
                                                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                                addSkill(category, e.currentTarget.value);
                                                                e.currentTarget.value = '';
                                                            }
                                                        }}
                                                        className="bg-background border-input"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Settings Section */}
                            <TabsContent value="settings">
                                <div className="space-y-6">
                                    {/* Section Ordering */}
                                    <Card className="bg-card text-card-foreground border-border">
                                        <CardHeader>
                                            <CardTitle>Section Order</CardTitle>
                                            <CardDescription>Set the order in which sections appear on your portfolio</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {Object.entries(sectionOrder)
                                                .sort(([,a], [,b]) => a - b)
                                                .map(([section, order]) => (
                                                <div key={section} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                        <span className="capitalize font-medium">{section}</span>
                                                    </div>
                                                    <Select
                                                        value={order.toString()}
                                                        onValueChange={(value) => updateSectionOrder(section as keyof SectionOrder, parseInt(value))}
                                                    >
                                                        <SelectTrigger className="w-20">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                                                <SelectItem key={num} value={num.toString()}>
                                                                    {num}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    {/* Theme Settings */}
                                    <Card className="bg-card text-card-foreground border-border">
                                        <CardHeader>
                                            <CardTitle>Theme Settings</CardTitle>
                                            <CardDescription>Customize theme, colors and appearance</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <Label>Default Theme Mode</Label>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant={editedData.theme.currentMode === 'light' ? 'default' : 'outline'}
                                                        onClick={() => updateField(['theme', 'currentMode'], 'light')}
                                                        size="sm"
                                                    >
                                                        Light
                                                    </Button>
                                                    <Button
                                                        variant={editedData.theme.currentMode === 'dark' ? 'default' : 'outline'}
                                                        onClick={() => updateField(['theme', 'currentMode'], 'dark')}
                                                        size="sm"
                                                    >
                                                        Dark
                                                    </Button>
                                                </div>
                                            </div>

                                            <Separator />

                                            {(['light', 'dark'] as const).map((mode) => (
                                                <div key={mode} className="space-y-4">
                                                    <h4 className="text-lg font-semibold capitalize">{mode} Theme Colors</h4>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        {Object.entries(editedData.theme.styles[mode]).map(([colorKey, colorValue]) => (
                                                            <div key={colorKey} className="space-y-2">
                                                                <Label className="text-sm font-medium">
                                                                    {colorKey.split('-').map(word => 
                                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                                    ).join(' ')}
                                                                </Label>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="color"
                                                                        value={oklchToHex(colorValue)}
                                                                        onChange={(e) => updateColorField(['theme', 'styles', mode, colorKey], e.target.value)}
                                                                        className="w-12 h-10 rounded border border-input cursor-pointer"
                                                                    />
                                                                    <Input
                                                                        value={colorValue}
                                                                        onChange={(e) => updateField(['theme', 'styles', mode, colorKey], e.target.value)}
                                                                        className="bg-background border-input font-mono text-sm flex-1"
                                                                        placeholder="oklch(50% 0.1 180)"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Theme Preview Sidebar */}
                    <div className="xl:col-span-1">
                        <div className="sticky top-4">
                            <Card className="bg-card text-card-foreground border-border">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">Theme Preview</CardTitle>
                                        <div className="flex gap-1">
                                            <Button
                                                variant={previewMode === 'light' ? 'default' : 'outline'}
                                                onClick={() => setPreviewMode('light')}
                                                size="sm"
                                                className="text-xs"
                                            >
                                                Light
                                            </Button>
                                            <Button
                                                variant={previewMode === 'dark' ? 'default' : 'outline'}
                                                onClick={() => setPreviewMode('dark')}
                                                size="sm"
                                                className="text-xs"
                                            >
                                                Dark
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div 
                                        className="p-4 rounded-lg border space-y-3"
                                        style={{
                                            backgroundColor: oklchToHex(editedData.theme.styles[previewMode].background),
                                            color: oklchToHex(editedData.theme.styles[previewMode].foreground),
                                            borderColor: oklchToHex(editedData.theme.styles[previewMode].border),
                                        }}
                                    >
                                        <div className="text-sm font-medium">Preview</div>
                                        
                                        <div 
                                            className="px-3 py-2 rounded text-sm"
                                            style={{
                                                backgroundColor: oklchToHex(editedData.theme.styles[previewMode].primary),
                                                color: oklchToHex(editedData.theme.styles[previewMode]["primary-foreground"]),
                                            }}
                                        >
                                            Primary Button
                                        </div>
                                        
                                        <div 
                                            className="px-3 py-2 rounded text-sm"
                                            style={{
                                                backgroundColor: oklchToHex(editedData.theme.styles[previewMode].secondary),
                                                color: oklchToHex(editedData.theme.styles[previewMode]["secondary-foreground"]),
                                            }}
                                        >
                                            Secondary Button
                                        </div>
                                        
                                        <div 
                                            className="p-3 rounded text-sm"
                                            style={{
                                                backgroundColor: oklchToHex(editedData.theme.styles[previewMode].card),
                                                color: oklchToHex(editedData.theme.styles[previewMode]["card-foreground"]),
                                                border: `1px solid ${oklchToHex(editedData.theme.styles[previewMode].border)}`,
                                            }}
                                        >
                                            <div className="font-medium mb-1">Card Component</div>
                                            <div 
                                                className="text-sm"
                                                style={{ color: oklchToHex(editedData.theme.styles[previewMode]["muted-foreground"]) }}
                                            >
                                                Card description text
                                            </div>
                                        </div>
                                        
                                        <div 
                                            className="px-3 py-2 rounded text-sm"
                                            style={{
                                                backgroundColor: oklchToHex(editedData.theme.styles[previewMode].accent),
                                                color: oklchToHex(editedData.theme.styles[previewMode]["accent-foreground"]),
                                            }}
                                        >
                                            Accent Element
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
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
    );
}
