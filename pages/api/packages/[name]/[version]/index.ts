import Axios, { AxiosError } from "axios";
import { NextApiHandler } from "next";
import { HexPackageVersion, HexRequirement, PackageVersion, Publisher, Requirement } from "./types";

const toGleamRequirements = (reqs: { [key: string]: HexRequirement }): Requirement[] => {
    const requirements: Requirement[] = [];

    for (const [key, value] of Object.entries(reqs)) {
        requirements.push({
            name: key,
            version: value.requirement,
            optional: value.optional,
            url: `https://hex.pm/packages/${key}`,
        })
    }

    return requirements;
}

const toGleamRelease = (name: string, pkg: HexPackageVersion): PackageVersion => {
    return {
        version: pkg.version,
        has_docs: pkg.has_docs,
        docs_url: pkg.docs_html_url,
        downloads: pkg.downloads,
        checksum: pkg.checksum,
        updated_at: pkg.updated_at,
        inserted_at: pkg.inserted_at,
        requirements: toGleamRequirements(pkg.requirements),
        publisher: pkg.publisher as Publisher,
        installs: {
            gleam: `${name} = "~> ${pkg.version}"`,
            hex: `{:${name}, "~> ${pkg.version}"}`
        }
    };
}

const getPackageVersion: NextApiHandler = async (req, res) => {
    const {
        name,
        version
    } = req.query as {
        [key: string]: string
    };

    try {
        const pkg = await Axios.get<HexPackageVersion>(`https://hex.pm/api/packages/${name}/releases/${version}`)

        if (!(pkg.data.meta.build_tools ?? []).includes("gleam")) {
            res.status(400).json({
                code: 400,
                message: "Not a Gleam package, use Hex",
                url: `https://hex.pm/packages/${name}`
            })
            return;
        }

        res.status(200).json(toGleamRelease(name, pkg.data))
    } catch (err) {
        if ((err?.response?.status ?? 0) == 404) {
            res.status(404).json({
                code: 404,
                message: "Not Found",
                package: name,
                version
            })
            return;
        }

        res.status(500).json({
            code: 500,
            message: err.toString()
        })
    }
}

export default getPackageVersion;