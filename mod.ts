import { startIpv4DDNS, startIpv6DDNS } from "./cloudflare-ddns.ts";
import { createOrPatchDNSRecord } from "./createOrPatchDNSRecord.ts";
import { get_dns_record_id_of_name_type } from "./get_dns_record_id_of_name_type.ts";
import { get_zone_id_of_name } from "./get_zone_id_of_name.ts";

export {
    createOrPatchDNSRecord,
    get_dns_record_id_of_name_type,
    get_zone_id_of_name,
    startIpv4DDNS,
    startIpv6DDNS,
};
