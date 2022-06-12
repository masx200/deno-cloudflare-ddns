import {
    CreateDNSRecord,
    DNSRecord,
    PatchDNSRecord,
} from "https://deno.land/x/masx200_cloudflare_api_dns_record_zone@1.0.2/mod.ts";
import { get_dns_record_id_of_name_type } from "./get_dns_record_id_of_name_type.ts";

export async function createOrPatchDNSRecord({
    ttl,
    content,
    api_token,
    dns_name,
    zone_id,
    dns_type,
    proxied,...rest
}: {
    content: string;
    api_token: string;
    ttl: number;
    zone_id: string;
    dns_name: string;
    dns_type: string;
    proxied?: boolean;
}&Partial<DNSRecord>): Promise<DNSRecord> {
    const id = await get_dns_record_id_of_name_type({
        api_token,
        dns_name,
        dns_type,
        zone_id,
    });
    if (!id) {
        return await CreateDNSRecord({
            zone_id,
            APIToken: api_token,
            record: {...rest,
                content,
                ttl,
                proxied,
                name: dns_name,
                type: dns_type as DNSRecord["type"],
            },
        });
    } else {
        return await PatchDNSRecord({
            id,
            zone_id,
            APIToken: api_token,
            record: {...rest,
                content,
                ttl,
                proxied,
                name: dns_name,
                type: dns_type as DNSRecord["type"],
            },
        });
    }
}
