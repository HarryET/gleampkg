import { NextApiHandler } from "next";
import Axios, { AxiosError } from "axios";
import { Author, GleamPackage, HexAuthor, HexPackage, HexRelease, Release } from "@gleampkg/packages";
import redis, { PACKAGE_TTL } from "../../../../lib/redis";
import gravatar from "gravatar";

const toGleamOwners = (authors: HexAuthor[]): Author[] => {
    return authors.map(author => {
        return {...author, avatar: gravatar.url(author.email, {s: "120"}, true)} as Author;
    }) as Author[];
}
const toGleamReleases = (name: string, releases: HexRelease[]): Release[] => {
    return releases.map(release => {
        return {
            ...release,
            url: `https://gleampkg.com/api/packages/${name}/${release.version}`
        };
    }) as Release[];
}

const toGleamPackage = (pkg: HexPackage): GleamPackage => {
    return {
        name: pkg.name,
        url: `https://gleampkg.com/packages/${pkg.name}`,
        api_url: `https://gleampkg.com/api/packages/${pkg.name}`,
        repository: pkg.repository,
        links: pkg.meta.links,
        description: pkg.meta.description,
        licenses: pkg.meta.licenses,
        latest_stable_version: pkg.latest_stable_version,
        latest_version: pkg.latest_version,
        installs: {
            gleam: `${pkg.name} = "~> ${pkg.latest_stable_version}"`,
            mix: `{:${pkg.name}, "~> ${pkg.latest_stable_version}"}`
        },
        owners: toGleamOwners(pkg.owners),
        releases: toGleamReleases(pkg.name, pkg.releases)
    }
}

const getPackage: NextApiHandler = async (req, res) => {
    const {
        name
    } = req.query as {
        [key: string]: string
    };

    await redis.connect();

    const valid = await redis.exists(`packages:invalid:${name}`);
    if (valid >= 1) {
        await redis.disconnect();

        res.status(400).json({
            code: 400,
            message: "Not a Gleam package, use Hex",
            url: `https://hex.pm/packages/${name}`
        });

        return;
    }

    const exists = await redis.exists(`packages:cache:${name}`);
    if (exists >= 1) {
        const pkg = await redis.json.get(`packages:cache:${name}`);

        await redis.disconnect();

        res.status(200).json(pkg);

        return;
    }

    try {
        const pkg = await Axios.get<HexPackage>(`https://hex.pm/api/packages/${name}`)

        const gleam_pkg = toGleamPackage(pkg.data);

        try {
            const release = await Axios.get(`https://hex.pm/api/packages/${name}/releases/${gleam_pkg.latest_stable_version}`)

            if (!(release.data.meta.build_tools ?? []).includes("gleam")) {
                res.status(400).json({
                    code: 400,
                    message: "Not a Gleam package, use Hex",
                    url: `https://hex.pm/packages/${name}`
                })

                await redis.set(`packages:invalid:${name}`, 1, {
                    EX: PACKAGE_TTL
                });

                await redis.disconnect();

                return;
            }
        } catch (err) {
            if ((err?.response?.status ?? 0) == 404) {
                res.status(404).json({
                    code: 404,
                    message: "Not Found",
                    package: name
                })
                return;
            }
    
            res.status(500).json({
                code: 500,
                message: err.toString()
            })
        }

        await redis.set(`packages:valid:${name}`, 1, {
            EX: PACKAGE_TTL
        })
        await redis.json.set(`packages:cache:${name}`, '$', gleam_pkg);
        await redis.expire(`packages:cache:${name}`, PACKAGE_TTL)

        await redis.disconnect();

        res.status(200).json(gleam_pkg);
    } catch (err) {
        if ((err?.response?.status ?? 0) == 404) {
            res.status(404).json({
                code: 404,
                message: "Not Found",
                package: name
            })
            return;
        }

        res.status(500).json({
            code: 500,
            message: err.toString()
        })
    }
}

export default getPackage;