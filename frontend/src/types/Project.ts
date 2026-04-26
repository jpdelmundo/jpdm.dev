export interface ProjectLink {
    url: string;
    label?: string;
    type?: 'demo' | 'docs' | 'github' | 'other';
}

export interface ProjectMedia {
    type: 'image' | 'video' | 'youtube-embed';
    url: string;
    caption?: string;
    title?: string;
}

export interface Project {
    id: string;
    name: string;
    year: string;
    description: string;
    tech: string[];
    links: ProjectLink[];
    media: ProjectMedia[];
    company?: string;
    role?: string;
    featured?: boolean;
}