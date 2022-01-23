import { NextPage } from "next"

const index: NextPage = () => {
  return (
    <div className={"w-full h-full flex flex-col items-center justify-center"}>
      <p className="text-2xl font-bold text-black">Work in progress</p>
      <p className="text-gray-700">There is no UI just yet but feel free to use the API</p>
      <div className={"flex flex-col items-center justify-center mt-4"}>
        <code>https://gleampkg.com/api/packages/:name</code>
        <code>https://gleampkg.com/api/packages/:name/:version</code>
      </div>
    </div>
  )
}

export default index;