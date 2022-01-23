// Gleampkg Types
export type GleamPackage = {
    installs: {
        gleam: string;
        hex: string;
    }
    latest_stable_version: string;
    latest_version: string;
    links: {
        [key: string]: string
    }
    description: string;
    licenses: string[];
    owners: Author[];
    releases: Release[];
    repository: string;
    name: string;
    url: string;
    api_url: string;
};

export type Author = {
    email: string;
    url: string;
    username: string;
}

export type Release = {
    has_docs: boolean;
    inserted_at: string;
    url: string;
    version: string;
}

// Hex Types
export interface HexPackage {
    configs: {
        [key: string]: string
    };
    docs_html_url: string;
    downloads: HexDownloads;
    html_url: string;
    inserted_at: string;
    latest_stable_version: string;
    latest_version: string;
    meta: HexMeta;
    name: string;
    owners: HexAuthor[];
    releases: HexRelease[];
    repository: string;
    retirements: {
        [key: string]: HexRetirement
    };
    updated_at: string;
    url: string;
}

export interface HexRelease {
    has_docs: boolean;
    inserted_at: string;
    url: string;
    version: string;
};

export interface HexAuthor {
    email: string;
    url: string;
    username: string;
}

export interface HexDownloads {
    all: number;
    day: number;
    recent: number;
    week: number;
}

export interface HexMeta {
    description: string;
    links: {
        [key: string]: string
    }
    licenses: string[]
}

export interface HexRetirement {
    message: string;
    reason: string;
}
