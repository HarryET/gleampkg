import { GetServerSideProps, NextPage } from "next";
import Axios from "axios";
import { GleamPackage } from "@gleampkg/packages";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {
        name
    } = context.params as {
        [key: string]: string
    };

    try {
        const pkg = await Axios.get<GleamPackage>(`https://gleampkg.com/api/packages/${name}`)

        return {
            props: {
                pkg: pkg.data
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

const packageUI: NextPage<{pkg: GleamPackage}> = ({ pkg }) => {
    return (
        <>
            <p>Name: {pkg.name}</p>
        </>
    )
}

export default packageUI;