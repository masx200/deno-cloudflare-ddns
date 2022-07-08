export function get_zone_name_from_dns_name(dns_name: string): string {
    const parts = dns_name.split(".");
    if (parts.length < 2) {
        throw new Error(`dns_name ${dns_name} is not valid`);
    }
    const zone_name = parts.slice(-2).join(".");
    return zone_name;
}
