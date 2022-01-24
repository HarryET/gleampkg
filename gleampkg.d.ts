declare module "@gleampkg/packages" {
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
        avatar: string;
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
}

declare module "@gleampkg/releases" {
    // Gleampkg Types
    export type PackageVersion = {
        docs_url?: string;
        has_docs: boolean;
        version: string;
        downloads: number;
        checksum: string;
        updated_at: string;
        inserted_at: string;
        requirements: Requirement[];
        publisher: Publisher;
        installs: {
            gleam: string;
            hex: string;
        }
    };

    export type Requirement = {
        name: string;
        version: string;
        optional: boolean;
        url: string;
    };

    export type Publisher = {
        username: string;
        email: string;
        url: string;
        avatar: string;
    };

    // Hex Types
    export interface HexPackageVersion {
        checksum: string;
        configs: {
            [key: string]: string
        };
        docs_html_url?: string;
        downloads: number;
        has_docs: boolean;
        html_url: string;
        inserted_at: string;
        meta: HexMeta;
        package_url: string;
        publisher: HexPublisher;
        requirements: {
            [key: string]: HexRequirement
        };
        retirement?: null;
        updated_at: string;
        url: string;
        version: string;
    }

    export interface HexMeta {
        app: string;
        build_tools?: (string)[] | null;
        elixir?: null;
    }

    export interface HexPublisher {
        email: string;
        url: string;
        username: string;
    }

    export interface HexRequirement {
        app: string;
        optional: boolean;
        requirement: string;
    }
}