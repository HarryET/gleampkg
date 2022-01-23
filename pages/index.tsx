import { NextPage } from "next"

const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

const index: NextPage = () => {
  return (
    <div className={"w-full h-full flex flex-col items-center justify-center"}>
      <p className="text-2xl font-bold text-black mb-1">Work in progress</p>
      <p className="text-gray-700">There is no UI just yet but feel free to use the API</p>
      <div className={"flex flex-col items-center justify-center mt-4"}>
        <code>https://gleampkg.com/api/packages/:name</code>
        <code>https://gleampkg.com/api/packages/:name/:version</code>
      </div>
      <div className="mt-4 text-gray-400">
        Built from <a className="text-pink-400 underline" href={`https://github.com/HarryET/gleampkg/commit/${sha}`}>{sha}</a>
      </div>
    </div>
  )
}

export default index;