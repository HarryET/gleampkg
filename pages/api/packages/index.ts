import { NextApiHandler } from "next";

const getPackages: NextApiHandler = (req, res) => {
    res.status(200).json([])
}

export default getPackages;