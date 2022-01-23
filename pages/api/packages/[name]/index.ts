import { NextApiHandler } from "next";
import Axios, { AxiosError } from "axios";
import { Author, GleamPackage, HexAuthor, HexPackage, HexRelease, Release } from "./types";
import redis from "../../../../lib/redis";

const toGleamOwners = (authors: HexAuthor[]): Author[] => {
    return authors.map(author => {
        return author as Author;
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
            hex: `{:${pkg.name}, "~> ${pkg.latest_stable_version}"}`
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

    const exists = await redis.exists(`packages:cache:${name}`);
    if (exists >= 1) {
        const pkg = await redis.json.get(`packages:cache:${name}`);

        res.status(200).json(pkg);

        await redis.disconnect();
        return;
    }

    const valid = (await redis.get(`packages:valid:${name}`)) ?? "1";
    if (valid == "0") {
        res.status(400).json({
            code: 400,
            message: "Not a Gleam package, use Hex",
            url: `https://hex.pm/packages/${name}`
        });

        await redis.disconnect();
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

                await redis.set(`packages:valid:${name}`, 0, {
                    EX: 15 * 60
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
                await redis.disconnect();
                return;
            }
    
            res.status(500).json({
                code: 500,
                message: err.toString()
            })
        }

        await redis.set(`packages:valid:${name}`, 1, {
            EX: 15 * 60
        })
        await redis.json.set(`packages:cache:${name}`, '$', gleam_pkg);
        await redis.expire(`packages:cache:${name}`, 15 * 60)
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

        await redis.disconnect();
    }
}

export default getPackage;