import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import redis from "../lib/redis";
import Head from "next/head";

const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

export const getServerSideProps: GetServerSideProps = async (context) => {
  await redis.connect();

  const valid_packages = (await redis.keys("packages:valid:*")) ?? []
  const versions = (await redis.keys("releases:*")) ?? []

  await redis.disconnect();

  return {
    props: {
      cached_valid_packages: valid_packages.length,
      cached_versions: versions.length
    }
  }
}

const index: NextPage = ({ cached_valid_packages, cached_versions }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      <Head>
        <title>gleampkg</title>
      </Head>
      <div className={"w-full h-full flex flex-col items-center justify-center"}>
        <p className="text-2xl font-bold text-black mb-1">Work in progress</p>
        <p className="text-gray-700">There is no UI just yet but feel free to use the API</p>
        <div className={"flex flex-col items-center justify-center mt-4"}>
          <code>https://gleampkg.com/api/packages/:name</code>
          <code>https://gleampkg.com/api/packages/:name/:version</code>
        </div>
        <div className={"flex flex-row space-x-4 mt-4 items-center justify-center"}>
          <div>
            <p>Currently cached <span className="font-bold text-pink-400">{cached_versions}</span> releases</p>
          </div>
          <div>
            <p>Currently knows <span className="font-bold text-pink-400">{cached_valid_packages}</span> packages</p>
          </div>
        </div>
        <div className="mt-4 text-gray-400">
          Built from <a className="text-pink-400 underline" href={`https://github.com/HarryET/gleampkg/commit/${sha}`}>{sha}</a>
        </div>
      </div>
    </>
  )
}

export default index;