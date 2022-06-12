import { delay } from "https://deno.land/std@0.143.0/async/delay.ts";
import { assert } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import {
    getPublicIpv4,
    getPublicIpv6,
} from "https://deno.land/x/masx200_get_public_ip_address@1.0.3/mod.ts";
import { createOrPatchDNSRecord } from "./createOrPatchDNSRecord.ts";
import { get_zone_id_of_name } from "./get_zone_id_of_name.ts";
const intervalDefault = 30 * 1000;
const intervalMinimum = 20 * 1000;
const retryDelay = 10 * 1000;
export function createStartDDNS(options: {
    dns_type: string;
    get_public_ip: () => Promise<string>;
}) {
    const { dns_type, get_public_ip } = options;
    return async function startDDNS(options: {
        proxied?: boolean;
        api_token: string;
        zone_name: string;
        dns_name: string;
        interval?: number;

        signal?: AbortSignal;
    }): Promise<void> {
        let {
            proxied,
            interval = intervalDefault,
            api_token,
            zone_name,
            dns_name,

            signal,
        } = options;
        const on_error = console.error;
        interval = Math.max(interval, intervalMinimum);
        const ttl = 1;
        let public_ip_address: string | undefined;
        try {
            await update_ipv6();
        } catch (error) {
            on_error(error);
            await delay(retryDelay, { signal });
            return startDDNS(options);
        }

        const zone_id = await get_zone_id_of_name({ api_token, zone_name });
        assert(typeof zone_id === "string");

        async function update_ipv6() {
            public_ip_address = await get_public_ip();
            console.log("public_ip_address", public_ip_address);
        }
        async function update_dns() {
            if (public_ip_address) {
                assert(typeof zone_id === "string");
                const record = await createOrPatchDNSRecord({
                    proxied,
                    ttl: ttl,
                    api_token,
                    dns_name,
                    dns_type,
                    zone_id: zone_id,
                    content: public_ip_address,
                });
                console.log("dns_record", record);
            }
        }
        if (signal?.aborted) {
            return;
        }
        await update_dns();
        const timer = setInterval(async () => {
            if (signal?.aborted) {
                return;
            }
            await Promise.all([update_ipv6(), update_dns()]).catch((e) =>
                on_error(e)
            );
        }, interval);
        signal?.addEventListener("abort", () => {
            clearInterval(timer);
        });
    };
}
export const startIpv6DDNS = createStartDDNS({
    dns_type: "AAAA",
    get_public_ip: getPublicIpv6,
});
export const startIpv4DDNS = createStartDDNS({
    dns_type: "A",
    get_public_ip: getPublicIpv4,
});
