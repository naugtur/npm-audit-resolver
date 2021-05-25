
interface Vuln {
    id: number,
    name: string,
    title: string,
    url: string,
    severity: string,
    range: string,
    fixAvailable: {
        name: string,
        version: string,
        isSemVerMajor: boolean
    },
    paths: Array<string>
}

interface VulnResolution extends Vuln {
    resolutions: Arry<{
        path: string,
        decision: any
    }>
}