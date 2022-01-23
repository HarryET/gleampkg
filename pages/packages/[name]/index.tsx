import { SearchIcon, CalendarIcon, LocationMarkerIcon, UsersIcon, InformationCircleIcon } from '@heroicons/react/solid'
import { GetServerSideProps, NextPage } from "next";
import Axios from "axios";
import { GleamPackage } from "@gleampkg/packages";
import { PackageVersion } from '@gleampkg/releases';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {
        name
    } = context.params as {
        [key: string]: string
    };

    try {
        const pkg = await Axios.get<GleamPackage>(`https://gleampkg.com/api/packages/${name}`)
        const latest_release = await Axios.get<PackageVersion>(`https://gleampkg.com/api/packages/${name}/${pkg.data.latest_stable_version}`)

        return {
            props: {
                pkg: pkg.data,
                latest_release: latest_release.data
            }
        }
    } catch (err) {
        if ((err?.response?.status ?? 0) == 404) {
            return {
                redirect: {
                    destination: "/?error=Package%20not%20Found",
                    permanent: false
                }
            }
        }

        if ((err?.response?.status ?? 0) == 400) {
            return {
                redirect: {
                    destination: "/?error=Not%20A%20Gleam%20Package",
                    permanent: false
                }
            }
        }

        return {
            redirect: {
                destination: "/?error=Internal%20Server%20Error",
                permanent: false
            }
        }
    }
}

const padTo2Digits = (num: number): string => {
    return num.toString().padStart(2, '0');
}

const formatDate = (date: Date): string => {
    return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
    ].join('/');
}

const formatTime = (date: Date): string => {
    return [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
    ].join(':');
}

const formatDateTime = (date: Date): string => {
    return [
        formatTime(date),
        formatDate(date)
    ].join(' ');
}

const packageUI: NextPage<{ pkg: GleamPackage, latest_release: PackageVersion }> = ({ pkg, latest_release }) => {
    return (
        <>
            <div className="min-h-full">
                <div className="bg-[#ffaff3] pb-32">
                    <nav className="bg-[#ffaff3] border-b border-[#99498d] border-opacity-25 lg:border-none">
                        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                            <div className="relative h-16 flex items-center justify-between lg:border-b lg:border-[#99498d] lg:border-opacity-25">
                                <div className="px-2 flex items-center lg:px-0">
                                    <div className="flex-shrink-0">
                                        <a href="/">
                                            <img
                                                className="block h-8 w-8"
                                                src="https://gleam.run/images/lucy-charcoal-2.svg"
                                                alt="Gleam Lucy"
                                            />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex-1 px-2 flex justify-end lg:ml-6">
                                    <div className="max-w-lg w-full lg:max-w-xs">
                                        <label htmlFor="search" className="sr-only">
                                            Search
                                        </label>
                                        <div className="relative text-gray-400 focus-within:text-gray-600">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                                <SearchIcon className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                            <input
                                                id="search"
                                                className="block w-full bg-white py-2 pl-10 pr-3 border border-transparent rounded-md leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white focus:border-white sm:text-sm"
                                                placeholder="Search"
                                                type="search"
                                                name="search"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                    <header className="py-10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-row items-end">
                            <h1 className="text-3xl font-bold text-gray-800">{pkg.name}</h1>
                            <h2 className="ml-2 text-gray-700">{pkg.latest_stable_version}</h2>
                        </div>
                    </header>
                </div>

                <main className="-mt-32">
                    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
                            <div className="w-full flex flex-row items-start justify-between">
                                <div className="w-full">
                                    <h3 className="text-xl leading-6 font-medium text-gray-900 mb-2">Releases <span className='text-sm text-gray-400'>({pkg.releases.length})</span></h3>
                                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                        <ul role="list" className="divide-y divide-gray-200">
                                            {pkg.releases.map((release) => (
                                                <li key={release.version}>
                                                    <a href={release.url} className="block hover:bg-gray-50">
                                                        <div className="px-4 py-4 sm:px-6">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-medium text-[#99498d] truncate">{release.version}</p>
                                                            </div>
                                                            <div className="mt-2 sm:flex sm:justify-between">
                                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                    <p>
                                                                        Created at <time dateTime={release.inserted_at}>{formatDateTime(new Date(release.inserted_at))}</time>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="w-full px-5">
                                    <h3 className="text-xl leading-6 font-medium text-gray-900 mb-2">Dependencies <span className='text-sm text-gray-400'>({latest_release.requirements.length})</span></h3>
                                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                        <ul role="list" className="divide-y divide-gray-200">
                                            {latest_release.requirements.map((dependency) => (
                                                <li key={dependency.name}>
                                                    <a href={dependency.url} className="block hover:bg-gray-50">
                                                        <div className="px-4 py-4 sm:px-6">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-medium text-[#99498d] truncate">{dependency.name}</p>
                                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                                    <code>
                                                                        {dependency.version}
                                                                    </code>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <h3 className="text-xl leading-6 font-medium text-gray-900 mb-2">Configs</h3>
                                    <div className="mb-2 w-full">
                                        <p className="text-md text-gray-700 mb-1">Gleam</p>
                                        <div className="w-full bg-gray-200 rounded p-2">
                                            <code>
                                                {pkg.installs.gleam}
                                            </code>
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <p className="text-md text-gray-700 mb-1">Hex</p>
                                        <div className="w-full bg-gray-200 rounded p-2">
                                            <code>
                                                {pkg.installs.hex}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* <footer className="w-full h-full bg-[#ffaff3] text-gray-800 py-6 flex flex-col justify-center items-center font-bold">
                    <div className="flex flex-row justify-center items-center">
                        Made with
                        <img src="/heart.svg" className="w-4 h-4 mx-1" />
                        by
                        <a className="text-[#99498d] underline ml-1" href='https://harryet.xyz'>Harry Bairstow</a>
                    </div>
                </footer> */}
            </div>
        </>
    )
}

export default packageUI;