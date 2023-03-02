
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

enum VulnResolutionValidationError {
    REASON_MISSING = 'reasonMissing',
    REASON_MISMATCH = 'reasonMismatch',
};

interface VulnResolution extends Vuln {
    resolutions: Array<{
        path: string,
        resolution: any,
        validationError: VulnResolutionValidationError | undefined
    }>
}