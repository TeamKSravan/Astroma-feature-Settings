export function capitalizeFirstLetter(str: string) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Formats a number with comma thousands separators, e.g. `1000018` → `"1,000,018"`. */
export function formatNumberWithCommas(value: number | string): string {
    const n = typeof value === 'string' ? Number(value.trim()) : value;
    if (!Number.isFinite(n)) {
        return '';
    }
    return new Intl.NumberFormat('en-US').format(n);
}

export function timeAgo(inputDate: string | undefined | null) {
    if (inputDate == null || inputDate === '') {
        return '';
    }
    const nowMs = Date.now();
    const pastMs = new Date(inputDate).getTime();
    if (!Number.isFinite(pastMs)) {
        return '';
    }
    let diffInSeconds = Math.floor((nowMs - pastMs) / 1000);
    if (diffInSeconds < 0) {
        diffInSeconds = 0;
    }

    if (diffInSeconds < 60) {
        return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}

