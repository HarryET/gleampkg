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
