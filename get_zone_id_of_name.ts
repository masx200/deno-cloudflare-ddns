import { ListZones } from "https://deno.land/x/masx200_cloudflare_api_dns_record_zone@1.0.0/mod.ts";

export async function get_zone_id_of_name({
    api_token,
    zone_name,
}: {
    api_token: string;
    zone_name: string;
}): Promise<string | null> {
    const zones = await ListZones({
        APIToken: api_token,
        parameters: { name: zone_name },
    });

    const zone = zones[0];
    return zone?.id ?? null;
}
