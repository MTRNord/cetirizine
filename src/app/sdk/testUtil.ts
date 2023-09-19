/// This checks for jest and disables the not logged in throws and uses returns instead
export function isTesting(): boolean {
    return typeof jest !== 'undefined'
}