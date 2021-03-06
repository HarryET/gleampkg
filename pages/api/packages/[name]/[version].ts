import Axios, { AxiosError } from "axios";
import { NextApiHandler } from "next";
import redis, { PACKAGE_TTL, RELEASE_TTL } from "../../../../lib/redis";
import { HexPackageVersion, HexRequirement, PackageVersion, Publisher, Requirement } from "@gleampkg/releases";
import gravatar from "gravatar";

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
    const publisher: Publisher = {...pkg.publisher, avatar: gravatar.url(pkg.publisher.email, {s: "120"}, true)};
    console.log(publisher);

    return {
        version: pkg.version,
        has_docs: pkg.has_docs,
        docs_url: pkg.docs_html_url,
        downloads: pkg.downloads,
        checksum: pkg.checksum,
        updated_at: pkg.updated_at,
        inserted_at: pkg.inserted_at,
        requirements: toGleamRequirements(pkg.requirements),
        publisher: publisher,
        installs: {
            gleam: `${name} = "~> ${pkg.version}"`,
            mix: `{:${name}, "~> ${pkg.version}"}`
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

    await redis.connect();

    const valid = await redis.exists(`packages:invalid:${name}`);
    if (valid >= 1) {
        res.status(400).json({
            code: 400,
            message: "Not a Gleam package, use Hex",
            url: `https://hex.pm/packages/${name}`
        });

        await redis.disconnect();
        return;
    }

    const exists = await redis.exists(`releases:${name}:${version}`);
    if (exists >= 1) {
        const pkg = await redis.json.get(`releases:${name}:${version}`);

        await redis.disconnect();

        res.status(200).json(pkg);

        return;
    }

    try {
        const pkg = await Axios.get<HexPackageVersion>(`https://hex.pm/api/packages/${name}/releases/${version}`)

        if (!(pkg.data.meta.build_tools ?? []).includes("gleam")) {
            res.status(400).json({
                code: 400,
                message: "Not a Gleam package, use Hex",
                url: `https://hex.pm/packages/${name}`
            })

            await redis.set(`packages:invalid:${name}`, 1, {
                EX: PACKAGE_TTL
            })

            await redis.disconnect();

            return;
        }

        const release = toGleamRelease(name, pkg.data);

        await redis.set(`packages:valid:${name}`, 1, {
            EX: PACKAGE_TTL
        })
        await redis.json.set(`releases:${name}:${version}`, '$', release);
        await redis.expire(`releases:${name}:${version}`, RELEASE_TTL);

        await redis.disconnect();

        res.status(200).json(release)
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