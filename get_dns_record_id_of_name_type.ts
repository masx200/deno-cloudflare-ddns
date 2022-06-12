import { ListDNSRecords } from "https://deno.land/x/masx200_cloudflare_api_dns_record_zone@1.0.2/mod.ts";

export async function get_dns_record_id_of_name_type({
    api_token,
    dns_name,
    zone_id,
    dns_type,
}: {
    api_token: string;
    zone_id: string;
    dns_name: string;
    dns_type: string;
}): Promise<string | null> {
    const records = await ListDNSRecords({
        zone_id,
        APIToken: api_token,
        parameters: { name: dns_name, type: dns_type, page: 1, per_page: 1 },
    });

    const record = records[0];
    return record?.id ?? null;
}
