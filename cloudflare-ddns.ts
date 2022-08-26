import { delay } from "https://deno.land/std@0.153.0/async/delay.ts";
import { assert } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import { DNSRecord } from "https://deno.land/x/masx200_cloudflare_api_dns_record_zone@1.0.3/DNSRecord.ts";
import {
    getPublicIpv4,
    getPublicIpv6,
} from "https://deno.land/x/masx200_get_public_ip_address@1.0.4/mod.ts";
import { createOrPatchDNSRecord } from "./createOrPatchDNSRecord.ts";
import { get_zone_id_of_name } from "./get_zone_id_of_name.ts";
import { get_zone_name_from_dns_name } from "./get_zone_name_from_dns_name.ts";
const intervalDefault = 30 * 1000;
const intervalMinimum = 30 * 1000;
const retryDelay = 15 * 1000;
export function createStartDDNS(options: {
    dns_type: string;
    get_ip: () => Promise<string>;
}) {
    const { dns_type, get_ip } = options;
    return async function startDDNS(
        options: {
            proxied?: boolean;
            api_token: string;
            zone_name?: string;
            zone_id?: string;
            dns_name: string;
            interval?: number;
            ttl?: number;
            signal?: AbortSignal;
        } & Partial<DNSRecord>,
    ): Promise<void> {
        let {
            zone_id: input_zone_id,
            ttl = 1,
            proxied,
            interval = intervalDefault,
            api_token,
            zone_name,
            dns_name,

            signal,
            ...rest
        } = options;
        if (signal?.aborted) {
            return;
        }

        const on_error = console.error;
        interval = Math.max(interval, intervalMinimum);

        let public_ip_address: string | undefined;
        try {
            await update_ipv6();
        } catch (error) {
            on_error(error);
            await delay(retryDelay, { signal });
            return startDDNS(options);
        }

        const zone_id = input_zone_id
            ? input_zone_id
            : await get_zone_id_of_name({
                api_token,
                zone_name: zone_name
                    ? zone_name
                    : get_zone_name_from_dns_name(dns_name),
            });
        assert(typeof zone_id === "string");

        async function update_ipv6() {
            public_ip_address = await get_ip();
            console.log("public_ip_address", public_ip_address);
        }
        async function update_dns() {
            if (public_ip_address) {
                assert(typeof zone_id === "string");
                const record = await createOrPatchDNSRecord({
                    ...rest,
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
        return new Promise<void>((s) => {
            if (signal?.aborted) {
                return s();
            }
            signal?.addEventListener("abort", () => {
                return s();
            });
        });
    };
}
export const startIpv6DDNS = createStartDDNS({
    dns_type: "AAAA",
    get_ip: getPublicIpv6,
});
export const startIpv4DDNS = createStartDDNS({
    dns_type: "A",
    get_ip: getPublicIpv4,
});
